import { Link } from "react-router-dom";
import { ArrowLeft, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import GuidedBreathing from "@/components/GuidedBreathing";

const Breathing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" aria-label="Back to Dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">MRI Corrector Pro</span>
          </div>
          <span className="ml-2 text-sm text-muted-foreground">/ Breathing Technique</span>
        </div>
      </header>

      {/* Guided Breathing Component */}
      <GuidedBreathing />
    </div>
  );
};

export default Breathing;
