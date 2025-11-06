import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, ArrowLeft, MapPin, Navigation } from "lucide-react";
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
}

const Hospitals = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortedHospitals, setSortedHospitals] = useState<Hospital[]>([]);
  const [locationError, setLocationError] = useState<string>("");

  // Leaflet map refs
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Fetch hospitals from Overpass API
  const fetchNearbyHospitals = async (lat: number, lon: number) => {
    const radius = 5000; // 5km radius
    const query = `
      [out:json];
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

    try {
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
      });
      const data = await response.json();
      
      const hospitals: Hospital[] = data.elements
        .filter((el: any) => el.tags?.name)
        .map((el: any, idx: number) => {
          let type: 'hospital' | 'clinic' | 'health_centre' | 'doctors' = 'hospital';
          if (el.tags?.amenity === 'clinic' || el.tags?.healthcare === 'clinic') {
            type = 'clinic';
          } else if (el.tags?.healthcare === 'centre') {
            type = 'health_centre';
          } else if (el.tags?.amenity === 'doctors') {
            type = 'doctors';
          }
          
          return {
            id: idx + 1,
            name: el.tags.name,
            lat: el.lat || el.center?.lat,
            lng: el.lon || el.center?.lon,
            address: el.tags['addr:full'] || el.tags['addr:street'] || 'Address not available',
            distance: calculateDistance(lat, lon, el.lat || el.center?.lat, el.lon || el.center?.lon),
            type
          };
        })
        .filter((h: Hospital) => h.lat && h.lng)
        .sort((a, b) => (a.distance || 0) - (b.distance || 0))
        .slice(0, 10); // Top 10 closest

      setSortedHospitals(hospitals);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      setLocationError('Failed to load nearby hospitals');
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const newLocation: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(newLocation);
          await fetchNearbyHospitals(newLocation[0], newLocation[1]);
          setLoading(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationError("Please enable location access to find nearby hospitals");
          setLoading(false);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser");
      setLoading(false);
    }
  }, []);

  // Initialize and update Leaflet map
  useEffect(() => {
    if (loading || !userLocation) return;

    // Initialize map once
    if (!mapRef.current && mapNodeRef.current) {
      mapRef.current = L.map(mapNodeRef.current, {
        center: userLocation as unknown as L.LatLngExpression,
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapRef.current);

      markersLayerRef.current = L.layerGroup().addTo(mapRef.current);
    }

    if (!mapRef.current || !markersLayerRef.current) return;

    // Update center
    mapRef.current.setView(userLocation, 13);

    // Clear and re-add markers
    markersLayerRef.current.clearLayers();

    // User marker (blue)
    L.marker(userLocation).addTo(markersLayerRef.current).bindPopup('Your Location');

    // Create colored icons for different facility types
    const hospitalIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const clinicIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const healthCentreIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const doctorsIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Get icon based on facility type
    const getIconForType = (type: string) => {
      switch(type) {
        case 'hospital': return hospitalIcon;
        case 'clinic': return clinicIcon;
        case 'health_centre': return healthCentreIcon;
        case 'doctors': return doctorsIcon;
        default: return hospitalIcon;
      }
    };

    // Medical facility markers with different colors
    sortedHospitals.forEach((h) => {
      const facilityType = h.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      const popupHtml = `<div class="min-w-[200px]"><strong>${h.name}</strong><br/><span class="text-xs text-gray-600">${facilityType}</span><br/><span>${h.address}</span>${h.distance ? `<br/><em>${h.distance.toFixed(1)} km away</em>` : ''}<br/><a href="https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}" target="_blank" rel="noopener noreferrer">Directions</a></div>`;
      L.marker([h.lat, h.lng], { icon: getIconForType(h.type) }).addTo(markersLayerRef.current as L.LayerGroup).bindPopup(popupHtml);
    });
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
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Medical Facilities</h1>
          <p className="text-muted-foreground">
            Locate nearby hospitals and medical centers for further consultation
          </p>
          {locationError && (
            <p className="text-yellow-600 text-sm mt-2 flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              {locationError}
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Hospital List */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Medical Facilities ({sortedHospitals.length})
              </h2>
              <div className="mb-4 p-3 bg-muted/50 rounded-lg space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Hospital</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Clinic</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span>Health Centre</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-violet-500"></div>
                  <span>Doctors</span>
                </div>
              </div>
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Finding hospitals near you...</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {sortedHospitals.map((hospital) => (
                    <Card
                      key={hospital.id}
                      className="p-4 hover:shadow-[var(--shadow-medical)] transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{hospital.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            hospital.type === 'hospital' ? 'bg-red-100 text-red-700' :
                            hospital.type === 'clinic' ? 'bg-green-100 text-green-700' :
                            hospital.type === 'health_centre' ? 'bg-orange-100 text-orange-700' :
                            'bg-violet-100 text-violet-700'
                          }`}>
                            {hospital.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                        {hospital.distance && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            {hospital.distance.toFixed(1)} km
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{hospital.address}</p>
                      <Button 
                        variant="medical" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
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
            <Card className="p-4 h-[600px]">
              {!loading ? (
                <div ref={mapNodeRef} className="h-full w-full rounded-lg" />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">Loading map and finding hospitals near you...</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hospitals;
