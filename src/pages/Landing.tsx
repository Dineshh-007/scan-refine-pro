import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, ImageIcon, MapPin, FileText, Zap, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import GuidedBreathing from "@/components/GuidedBreathing";

const Landing = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Correction",
      description: "Advanced algorithms detect and correct MRI distortions with precision",
    },
    {
      icon: ImageIcon,
      title: "Before & After Comparison",
      description: "Visual slider to compare original and corrected images side-by-side",
    },
    {
      icon: FileText,
      title: "Detailed Reports",
      description: "Generate comprehensive correction reports with transformation data",
    },
    {
      icon: MapPin,
      title: "Nearby Hospitals",
      description: "Locate nearby medical facilities with integrated mapping",
    },
    {
      icon: Zap,
      title: "Multiple Algorithms",
      description: "Choose from bilinear, polynomial, or AI-based correction methods",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your medical data is encrypted and handled with utmost security",
    },
  ];

  const team = [
    { name: "Yamuna", role: "Faculty" },
    { name: "Dinesh", role: "Developer" },
    { name: "Arjun", role: "Developer" },
    { name: "Poovarasan", role: "Developer" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">MRI Corrector Pro</span>
          </div>
          <Link to="/auth">
            <Button variant="medical">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight">
            Advanced MRI Distortion Correction
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional-grade image correction powered by AI and mathematical precision. 
            Transform distorted MRI scans into crystal-clear diagnostic images.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/auth">
              <Button size="lg" variant="medical">
                Start Correcting Images
              </Button>
            </Link>
            <Link to="/process">
              <Button size="lg" variant="outline">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-6 hover:shadow-[var(--shadow-medical)] transition-shadow border-border/50"
            >
              <feature.icon className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-r from-primary/5 to-accent/5 rounded-3xl my-20">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="max-w-4xl mx-auto space-y-8">
          {[
            { step: "1", title: "Upload Your MRI Image", desc: "Support for PNG, JPG, JPEG, DCM, and NII formats" },
            { step: "2", title: "AI Analyzes Distortion", desc: "Advanced algorithms detect distortion patterns and severity" },
            { step: "3", title: "Select Correction Method", desc: "Choose from bilinear, polynomial, or AI-based correction" },
            { step: "4", title: "Download & Share Results", desc: "Get corrected images and detailed correction reports" },
          ].map((item, index) => (
            <div key={index} className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-primary to-accent text-white flex items-center justify-center text-xl font-bold">
                {item.step}
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Our Team</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {team.map((member, index) => (
            <Card key={index} className="p-6 text-center min-w-[150px] hover:shadow-[var(--shadow-medical)] transition-shadow">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                {member.name[0]}
              </div>
              <h3 className="font-semibold text-lg">{member.name}</h3>
              <p className="text-sm text-muted-foreground">{member.role}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Guided Breathing Section */}
      <GuidedBreathing />

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Card className="p-12 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your MRI Images?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join medical professionals worldwide who trust our advanced correction technology
          </p>
          <Link to="/auth">
            <Button size="lg" variant="medical">
              Get Started Now
            </Button>
          </Link>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© 2025 MRI Distortion Corrector Pro. Built with precision and care.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
