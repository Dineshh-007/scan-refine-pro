import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Upload, ArrowLeft, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Process = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [correctedUrl, setCorrectedUrl] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [correctionMethod, setCorrectionMethod] = useState<"bilinear" | "polynomial" | "ai">("bilinear");
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setCorrectedUrl("");
    }
  };

  const handleProcess = () => {
    setProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setCorrectedUrl(previewUrl); // In real app, this would be the corrected image
      setProcessing(false);
      toast({
        title: "Correction Complete",
        description: `Image corrected using ${correctionMethod} method`,
      });
    }, 3000);
  };

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
              <span className="text-xl font-bold">Image Correction</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Upload Section */}
          {!selectedFile ? (
            <Card className="p-12">
              <div className="text-center">
                <Upload className="h-20 w-20 mx-auto mb-6 text-primary" />
                <h2 className="text-2xl font-bold mb-4">Upload MRI Image</h2>
                <p className="text-muted-foreground mb-8">
                  Supported formats: PNG, JPG, JPEG, DCM, NII
                </p>
                <label htmlFor="file-upload">
                  <Button variant="medical" size="lg" asChild>
                    <span>Choose File</span>
                  </Button>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".png,.jpg,.jpeg,.dcm,.nii"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </Card>
          ) : (
            <>
              {/* Correction Method Selection */}
              <Card className="p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Select Correction Method</h3>
                <div className="flex gap-4 flex-wrap">
                  <Button
                    variant={correctionMethod === "bilinear" ? "medical" : "outline"}
                    onClick={() => setCorrectionMethod("bilinear")}
                  >
                    Bilinear Transformation
                  </Button>
                  <Button
                    variant={correctionMethod === "polynomial" ? "medical" : "outline"}
                    onClick={() => setCorrectionMethod("polynomial")}
                  >
                    Polynomial Mapping
                  </Button>
                  <Button
                    variant={correctionMethod === "ai" ? "medical" : "outline"}
                    onClick={() => setCorrectionMethod("ai")}
                  >
                    AI-Based Correction
                  </Button>
                </div>
              </Card>

              {/* Image Comparison */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Original Image</h3>
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Original MRI"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Corrected Image</h3>
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                    {correctedUrl ? (
                      <img
                        src={correctedUrl}
                        alt="Corrected MRI"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <p className="text-muted-foreground">
                        {processing ? "Processing..." : "Click 'Process Image' to start"}
                      </p>
                    )}
                  </div>
                </Card>
              </div>

              {/* Actions */}
              <div className="flex gap-4 justify-center">
                {!correctedUrl ? (
                  <Button
                    variant="medical"
                    size="lg"
                    onClick={handleProcess}
                    disabled={processing}
                  >
                    {processing ? "Processing..." : "Process Image"}
                  </Button>
                ) : (
                  <>
                    <Button variant="medical" size="lg">
                      <Download className="mr-2 h-5 w-5" />
                      Download Corrected Image
                    </Button>
                    <Button variant="outline" size="lg">
                      Generate Report
                    </Button>
                  </>
                )}
                <label htmlFor="file-reupload">
                  <Button variant="outline" size="lg" asChild>
                    <span>Upload New Image</span>
                  </Button>
                </label>
                <input
                  id="file-reupload"
                  type="file"
                  accept=".png,.jpg,.jpeg,.dcm,.nii"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Process;
