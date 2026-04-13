import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, ArrowLeft, MapPin, Navigation, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Hospital {
  id: number;
  name: string;
  lat: number;
  lng: number;
  address: string;
  distance?: number;
  type: 'hospital' | 'clinic' | 'health_centre' | 'doctors';
  phone?: string;
}

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
];

const makeIcon = (color: string) =>
  L.icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

const typeColor: Record<Hospital['type'], string> = {
  hospital: 'red',
  clinic: 'green',
  health_centre: 'orange',
  doctors: 'violet',
};

const typeBadge: Record<Hospital['type'], string> = {
  hospital:     'bg-red-100 text-red-700',
  clinic:       'bg-green-100 text-green-700',
  health_centre:'bg-orange-100 text-orange-700',
  doctors:      'bg-violet-100 text-violet-700',
};

const Hospitals = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [sortedHospitals, setSortedHospitals] = useState<Hospital[]>([]);
  const [locationError, setLocationError] = useState<string>("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const markerMapRef = useRef<Map<number, L.Marker>>(new Map());

  // ─── Haversine ────────────────────────────────────────────────────────────
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // ─── Build Overpass query ─────────────────────────────────────────────────
  const buildQuery = (lat: number, lon: number, radius: number) => `
    [out:json][timeout:25];
    (
      node["amenity"="hospital"](around:${radius},${lat},${lon});
      way["amenity"="hospital"](around:${radius},${lat},${lon});
      node["amenity"="clinic"](around:${radius},${lat},${lon});
      way["amenity"="clinic"](around:${radius},${lat},${lon});
      node["amenity"="doctors"](around:${radius},${lat},${lon});
      way["amenity"="doctors"](around:${radius},${lat},${lon});
      node["healthcare"="centre"](around:${radius},${lat},${lon});
      way["healthcare"="centre"](around:${radius},${lat},${lon});
      node["healthcare"="clinic"](around:${radius},${lat},${lon});
      way["healthcare"="clinic"](around:${radius},${lat},${lon});
    );
    out body;
    >;
    out skel qt;
  `;

  // ─── Fetch with retry across multiple endpoints ────────────────────────────
  const fetchNearbyHospitals = useCallback(async (lat: number, lon: number) => {
    setFetchError(false);

    const radii = [5000, 10000]; // fallback to 10 km if 5 km yields nothing
    for (const radius of radii) {
      for (let attempt = 0; attempt < OVERPASS_ENDPOINTS.length; attempt++) {
        const endpoint = OVERPASS_ENDPOINTS[attempt];
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 12000);

          const response = await fetch(endpoint, {
            method: 'POST',
            body: buildQuery(lat, lon, radius),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (!response.ok) continue;

          const data = await response.json();

          const hospitals: Hospital[] = data.elements
            .filter((el: any) => el.tags?.name)
            .map((el: any, idx: number) => {
              let type: Hospital['type'] = 'hospital';
              if (el.tags?.amenity === 'clinic' || el.tags?.healthcare === 'clinic') type = 'clinic';
              else if (el.tags?.healthcare === 'centre') type = 'health_centre';
              else if (el.tags?.amenity === 'doctors') type = 'doctors';

              const elLat = el.lat ?? el.center?.lat;
              const elLng = el.lon ?? el.center?.lon;

              return {
                id: idx + 1,
                name: el.tags.name,
                lat: elLat,
                lng: elLng,
                address: el.tags['addr:full'] || el.tags['addr:street'] || 'Address not available',
                phone: el.tags['contact:phone'] || el.tags['phone'] || undefined,
                distance: calculateDistance(lat, lon, elLat, elLng),
                type,
              };
            })
            .filter((h: Hospital) => h.lat && h.lng)
            .sort((a: Hospital, b: Hospital) => (a.distance || 0) - (b.distance || 0))
            .slice(0, 12);

          if (hospitals.length > 0) {
            setSortedHospitals(hospitals);
            return; // success — exit
          }
          // zero results: try wider radius
          break;
        } catch {
          // try next endpoint
          await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
        }
      }
    }

    // All attempts failed or truly nothing found
    setFetchError(true);
  }, []);

  // ─── Geolocation ──────────────────────────────────────────────────────────
  const locateAndFetch = useCallback(() => {
    setLoading(true);
    setFetchError(false);
    setSortedHospitals([]);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const loc: [number, number] = [position.coords.latitude, position.coords.longitude];
        setUserLocation(loc);
        await fetchNearbyHospitals(loc[0], loc[1]);
        setLoading(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationError("Please enable location access to find nearby hospitals");
        setLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [fetchNearbyHospitals]);

  useEffect(() => { locateAndFetch(); }, []);

  // ─── Re-centre to user on map ──────────────────────────────────────────────
  const handleLocateMe = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.flyTo(userLocation, 14, { animate: true, duration: 1 });
    }
  };

  // ─── Pan to hospital & open popup ─────────────────────────────────────────
  const handleHospitalClick = (hospital: Hospital) => {
    setSelectedId(hospital.id);
    if (mapRef.current) {
      mapRef.current.flyTo([hospital.lat, hospital.lng], 16, { animate: true, duration: 0.8 });
    }
    const marker = markerMapRef.current.get(hospital.id);
    if (marker) marker.openPopup();
  };

  // ─── Leaflet map init & update ─────────────────────────────────────────────
  useEffect(() => {
    if (loading || !userLocation) return;

    if (!mapRef.current && mapNodeRef.current) {
      mapRef.current = L.map(mapNodeRef.current, {
        center: userLocation as unknown as L.LatLngExpression,
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);

      L.control.scale({ metric: true, imperial: false }).addTo(mapRef.current);

      markersLayerRef.current = L.layerGroup().addTo(mapRef.current);
    }

    if (!mapRef.current || !markersLayerRef.current) return;

    mapRef.current.setView(userLocation, 13);
    markersLayerRef.current.clearLayers();
    markerMapRef.current.clear();

    // User location marker
    const userMarker = L.marker(userLocation, {
      icon: L.divIcon({
        className: '',
        html: `<div style="
          width:20px;height:20px;border-radius:50%;
          background:rgba(59,130,246,0.9);
          border:3px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,0.4);
        "></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      }),
    }).addTo(markersLayerRef.current);
    userMarker.bindPopup('<strong>📍 Your Location</strong>');

    // Hospital markers
    const bounds: L.LatLngTuple[] = [userLocation];

    sortedHospitals.forEach((h) => {
      const facilityType = h.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      const popupHtml = `
        <div style="min-width:220px;font-family:sans-serif;font-size:13px;line-height:1.5">
          <div style="font-weight:700;font-size:14px;margin-bottom:4px">${h.name}</div>
          <div style="display:inline-block;background:#e0f2fe;color:#0369a1;border-radius:999px;padding:1px 8px;font-size:11px;margin-bottom:6px">${facilityType}</div>
          <div style="color:#555;margin-bottom:4px">📍 ${h.address}</div>
          ${h.phone ? `<div style="color:#555;margin-bottom:4px">📞 ${h.phone}</div>` : ''}
          ${h.distance ? `<div style="color:#555;margin-bottom:8px">🚗 ${h.distance.toFixed(1)} km away</div>` : ''}
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}"
            target="_blank" rel="noopener noreferrer"
            style="display:block;background:#2563eb;color:white;text-align:center;padding:6px 12px;border-radius:6px;text-decoration:none;font-weight:600"
          >Get Directions →</a>
        </div>`;

      const marker = L.marker([h.lat, h.lng], { icon: makeIcon(typeColor[h.type]) })
        .addTo(markersLayerRef.current as L.LayerGroup)
        .bindPopup(popupHtml, { maxWidth: 260 });

      markerMapRef.current.set(h.id, marker);
      bounds.push([h.lat, h.lng]);
    });

    if (bounds.length > 1) {
      mapRef.current.fitBounds(bounds as L.LatLngBoundsLiteral, { padding: [40, 40], maxZoom: 15 });
    }
  }, [loading, userLocation, sortedHospitals]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Nearby Hospitals</span>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={locateAndFetch} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Medical Facilities</h1>
          <p className="text-muted-foreground">
            Locate nearby hospitals and medical centers for further consultation
          </p>
          {locationError && (
            <div className="mt-3 flex items-center gap-2 text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{locationError}</span>
            </div>
          )}
        </div>

        {/* Fatal fetch error with retry */}
        {fetchError && !loading && (
          <Card className="p-8 mb-6 border-red-200 bg-red-50">
            <div className="flex flex-col items-center text-center gap-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-700 mb-1">Failed to Load Hospitals</h3>
                <p className="text-sm text-red-500 mb-4">
                  Could not reach the hospital directory. Check your connection and try again.
                </p>
                <Button variant="medical" onClick={locateAndFetch}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Hospital List */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Medical Facilities ({sortedHospitals.length})
              </h2>

              {/* Legend */}
              <div className="mb-4 p-3 bg-muted/50 rounded-lg grid grid-cols-2 gap-y-1.5 text-xs">
                {[
                  { color: 'bg-red-500', label: 'Hospital' },
                  { color: 'bg-green-500', label: 'Clinic' },
                  { color: 'bg-orange-500', label: 'Health Centre' },
                  { color: 'bg-violet-500', label: 'Doctors' },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${color}`} />
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              {loading ? (
                <div className="text-center py-8 flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground text-sm">Finding hospitals near you…</p>
                </div>
              ) : sortedHospitals.length === 0 && !fetchError ? (
                <div className="text-center py-8">
                  <MapPin className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
                  <p className="text-muted-foreground text-sm">No facilities found nearby.<br/>Try refreshing or widening the search.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {sortedHospitals.map((hospital) => (
                    <Card
                      key={hospital.id}
                      className={`p-4 cursor-pointer transition-all hover:shadow-[var(--shadow-medical)] ${
                        selectedId === hospital.id ? 'ring-2 ring-primary ring-offset-1' : ''
                      }`}
                      onClick={() => handleHospitalClick(hospital)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{hospital.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${typeBadge[hospital.type]}`}>
                            {hospital.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                        {hospital.distance && (
                          <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full whitespace-nowrap">
                            {hospital.distance.toFixed(1)} km
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 truncate">{hospital.address}</p>
                      <Button
                        variant="medical"
                        size="sm"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            `https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`,
                            '_blank',
                            'noopener,noreferrer'
                          );
                        }}
                      >
                        <Navigation className="mr-2 h-4 w-4" />
                        Get Directions
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="p-4 h-[600px] relative overflow-hidden">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center gap-3">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-muted-foreground text-sm">Loading map…</p>
                </div>
              ) : !userLocation ? (
                <div className="h-full flex flex-col items-center justify-center gap-3">
                  <MapPin className="h-12 w-12 text-muted-foreground opacity-40" />
                  <p className="text-muted-foreground">Location access required to show the map.</p>
                </div>
              ) : (
                <>
                  <div ref={mapNodeRef} className="h-full w-full rounded-lg z-0" />
                  {/* Locate-Me overlay button */}
                  <button
                    onClick={handleLocateMe}
                    title="Centre on my location"
                    className="absolute top-6 right-6 z-[1000] bg-white shadow-md hover:shadow-lg border border-gray-200 rounded-full w-10 h-10 flex items-center justify-center transition-all hover:bg-blue-50"
                  >
                    <Navigation className="h-5 w-5 text-blue-600" />
                  </button>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hospitals;
