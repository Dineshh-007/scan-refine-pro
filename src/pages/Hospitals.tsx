import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, ArrowLeft, MapPin, Navigation } from "lucide-react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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
}

const Hospitals = () => {
  const [userLocation, setUserLocation] = useState<[number, number]>([13.0827, 80.2707]); // Default: Chennai
  const [loading, setLoading] = useState(true);
  const [sortedHospitals, setSortedHospitals] = useState<Hospital[]>([]);
  const [locationError, setLocationError] = useState<string>("");

  // Mock hospital data - in real app, this would come from an API
  const hospitals: Hospital[] = [
    { id: 1, name: "Apollo Hospital", lat: 13.0569, lng: 80.2425, address: "Greams Road, Chennai" },
    { id: 2, name: "Fortis Malar Hospital", lat: 13.0569, lng: 80.2569, address: "Adyar, Chennai" },
    { id: 3, name: "MIOT Hospital", lat: 13.0118, lng: 80.2184, address: "Manapakkam, Chennai" },
    { id: 4, name: "Kauvery Hospital", lat: 13.0338, lng: 80.2275, address: "Alwarpet, Chennai" },
    { id: 5, name: "Vijaya Hospital", lat: 13.0253, lng: 80.2250, address: "Vadapalani, Chennai" },
    { id: 6, name: "Global Hospitals", lat: 13.0094, lng: 80.2085, address: "Perumbakkam, Chennai" },
    { id: 7, name: "SIMS Hospital", lat: 13.0205, lng: 80.2154, address: "Vadapalani, Chennai" },
  ];

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

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(newLocation);
          
          // Calculate distances and sort hospitals
          const hospitalsWithDistance = hospitals.map(hospital => ({
            ...hospital,
            distance: calculateDistance(
              newLocation[0],
              newLocation[1],
              hospital.lat,
              hospital.lng
            )
          })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
          
          setSortedHospitals(hospitalsWithDistance);
          setLoading(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationError("Unable to get your location. Showing default hospitals.");
          setSortedHospitals(hospitals);
          setLoading(false);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
      setSortedHospitals(hospitals);
      setLoading(false);
    }
  }, []);

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
                Nearby Hospitals ({sortedHospitals.length})
              </h2>
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
                        <h3 className="font-semibold">{hospital.name}</h3>
                        {hospital.distance && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            {hospital.distance.toFixed(1)} km
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{hospital.address}</p>
                      <Button variant="medical" size="sm" asChild className="w-full">
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Navigation className="mr-2 h-4 w-4" />
                          Get Directions
                        </a>
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
                <MapContainer
                  center={userLocation}
                  zoom={13}
                  scrollWheelZoom={true}
                  className="h-full w-full rounded-lg"
                  key={`${userLocation[0]}-${userLocation[1]}`}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={userLocation}>
                    <Popup>
                      <div className="text-center">
                        <p className="font-semibold text-primary">Your Location</p>
                      </div>
                    </Popup>
                  </Marker>
                  {sortedHospitals.map((hospital) => (
                    <Marker key={hospital.id} position={[hospital.lat, hospital.lng]}>
                      <Popup>
                        <div className="min-w-[200px]">
                          <h3 className="font-semibold mb-1">{hospital.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{hospital.address}</p>
                          {hospital.distance && (
                            <p className="text-xs text-primary mb-2">
                              {hospital.distance.toFixed(1)} km away
                            </p>
                          )}
                          <Button variant="medical" size="sm" asChild className="w-full">
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Directions
                            </a>
                          </Button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
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
