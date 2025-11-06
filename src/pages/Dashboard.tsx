import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Upload, History, MapPin, FileText, Settings, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import barrelImg from "@/assets/distortion_barrel.jpg";
import pincushionImg from "@/assets/distortion_pincushion.jpg";
import waveImg from "@/assets/distortion_wave.jpg";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">MRI Corrector Pro</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
            <Button 
              variant="outline"
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = '/auth';
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Welcome to Your Dashboard</h1>
          <p className="text-muted-foreground">
            Upload and correct MRI images with advanced algorithms
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link to="/process">
            <Card className="p-6 hover:shadow-[var(--shadow-medical)] transition-shadow cursor-pointer group">
              <Upload className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-2">Upload Image</h3>
              <p className="text-muted-foreground text-sm">
                Start a new correction process
              </p>
            </Card>
          </Link>

          <Link to="/reports">
            <Card className="p-6 hover:shadow-[var(--shadow-medical)] transition-shadow cursor-pointer group">
              <History className="h-12 w-12 text-accent mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-2">History</h3>
              <p className="text-muted-foreground text-sm">
                View past corrections
              </p>
            </Card>
          </Link>

          <Link to="/hospitals">
            <Card className="p-6 hover:shadow-[var(--shadow-medical)] transition-shadow cursor-pointer group">
              <MapPin className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-2">Hospitals</h3>
              <p className="text-muted-foreground text-sm">
                Find nearby facilities
              </p>
            </Card>
          </Link>

          <Link to="/educate">
            <Card className="p-6 hover:shadow-[var(--shadow-medical)] transition-shadow cursor-pointer group">
              <BookOpen className="h-12 w-12 text-secondary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-2">Education Center</h3>
              <p className="text-muted-foreground text-sm">
                Learn about MRI distortions
              </p>
            </Card>
          </Link>
        </div>

        {/* Sample Distorted Images */}
        <Card className="p-6 mb-12">
          <h2 className="text-2xl font-bold mb-6">Understanding MRI Distortions</h2>
          <p className="text-muted-foreground mb-6">
            Learn to identify common distortion patterns in MRI images
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={barrelImg}
                  alt="MRI barrel distortion example with edges bulging outward"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="font-semibold text-sm">Barrel Distortion</p>
              <p className="text-sm text-muted-foreground">Edges curve outward</p>
            </div>
            
            <div className="space-y-2">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={pincushionImg}
                  alt="MRI pincushion distortion example with edges bending inward"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="font-semibold text-sm">Pincushion Distortion</p>
              <p className="text-sm text-muted-foreground">Edges curve inward</p>
            </div>

            <div className="space-y-2">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={waveImg}
                  alt="MRI wave distortion example with ripple-like warping"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="font-semibold text-sm">Wave Distortion</p>
              <p className="text-sm text-muted-foreground">Irregular warping</p>
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
          <div className="text-center py-12 text-muted-foreground">
            <History className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>No recent corrections yet</p>
            <p className="text-sm mt-2">Upload your first MRI image to get started</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
