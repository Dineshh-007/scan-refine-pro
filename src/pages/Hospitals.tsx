import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, ArrowLeft, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Hospital {
  id: number;
  name: string;
  lat: number;
  lng: number;
  address: string;
}

// Component to update map center
const ChangeView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

const Hospitals = () => {
  const [userLocation, setUserLocation] = useState<[number, number]>([13.0827, 80.2707]); // Default: Chennai
  const [loading, setLoading] = useState(true);

  // Mock hospital data - in real app, this would come from an API
  const hospitals: Hospital[] = [
    { id: 1, name: "Apollo Hospital", lat: 13.0569, lng: 80.2425, address: "Greams Road, Chennai" },
    { id: 2, name: "Fortis Malar Hospital", lat: 13.0569, lng: 80.2569, address: "Adyar, Chennai" },
    { id: 3, name: "MIOT Hospital", lat: 13.0118, lng: 80.2184, address: "Manapakkam, Chennai" },
    { id: 4, name: "Kauvery Hospital", lat: 13.0338, lng: 80.2275, address: "Alwarpet, Chennai" },
    { id: 5, name: "Vijaya Hospital", lat: 13.0253, lng: 80.2250, address: "Vadapalani, Chennai" },
  ];

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          setLoading(false);
        },
        () => {
          setLoading(false);
        }
      );
    } else {
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
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Hospital List */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Nearby Hospitals
              </h2>
              <div className="space-y-3">
                {hospitals.map((hospital) => (
                  <Card
                    key={hospital.id}
                    className="p-4 hover:shadow-[var(--shadow-medical)] transition-shadow cursor-pointer"
                  >
                    <h3 className="font-semibold mb-1">{hospital.name}</h3>
                    <p className="text-sm text-muted-foreground">{hospital.address}</p>
                    <Button variant="link" className="p-0 h-auto mt-2" asChild>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Get Directions →
                      </a>
                    </Button>
                  </Card>
                ))}
              </div>
            </Card>
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="p-4 h-[600px]">
              {!loading ? (
                <MapContainer
                  center={userLocation}
                  zoom={13}
                  className="h-full w-full rounded-lg"
                >
                  <ChangeView center={userLocation} />
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {hospitals.map((hospital) => (
                    <Marker key={hospital.id} position={[hospital.lat, hospital.lng]}>
                      <Popup>
                        <div className="text-center">
                          <h3 className="font-semibold">{hospital.name}</h3>
                          <p className="text-sm text-muted-foreground">{hospital.address}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">Loading map...</p>
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
