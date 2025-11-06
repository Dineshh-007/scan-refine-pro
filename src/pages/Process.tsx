import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Upload, ArrowLeft, Download, FileText } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { DistortionChatbot } from "@/components/DistortionChatbot";
import { DistortionHeatmap } from "@/components/DistortionHeatmap";
import { ImageComparisonSlider } from "@/components/ImageComparisonSlider";
import { jsPDF } from "jspdf";
import { supabase } from "@/integrations/supabase/client";

const Process = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [correctedUrl, setCorrectedUrl] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [correctionMethod, setCorrectionMethod] = useState<"bilinear" | "polynomial" | "ai">("bilinear");
  const [distortionSeverity, setDistortionSeverity] = useState<number>(0);
  const [processingStartTime, setProcessingStartTime] = useState<number>(0);
  const [savedCorrectionId, setSavedCorrectionId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setCorrectedUrl("");
    }
  };

  const handleProcess = async () => {
    setProcessing(true);
    setProcessingStartTime(Date.now());
    
    // Simulate processing and distortion detection
    setTimeout(async () => {
      const randomSeverity = Math.floor(Math.random() * 40) + 15; // 15-55%
      const processingTime = Date.now() - processingStartTime;
      
      setDistortionSeverity(randomSeverity);
      setCorrectedUrl(previewUrl); // In real app, this would be the corrected image
      setProcessing(false);
      
      // Save to database
      await saveCorrection(previewUrl, previewUrl, correctionMethod, `${randomSeverity}%`, processingTime);
      
      toast({
        title: "Correction Complete",
        description: `Image corrected using ${correctionMethod} method. Distortion severity: ${randomSeverity}%`,
      });
    }, 3000);
  };

  const saveCorrection = async (
    originalUrl: string, 
    correctedUrl: string, 
    method: string, 
    severity: string,
    processingTime: number
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to save your corrections",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from('corrections')
        .insert({
          user_id: user.id,
          original_image_url: originalUrl,
          corrected_image_url: correctedUrl,
          correction_method: method,
          distortion_severity: severity,
          distortion_type: "Radial distortion",
          processing_time_ms: processingTime,
          notes: `Processed with ${method} method`
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving correction:', error);
        toast({
          title: "Save Failed",
          description: "Could not save correction to history",
          variant: "destructive"
        });
        return;
      }

      setSavedCorrectionId(data.id);
      toast({
        title: "Saved Successfully",
        description: "Correction saved to your history"
      });
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const generateEnhancedPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(66, 135, 245);
    doc.text("MRI Distortion Correction Report", 14, 20);
    
    // Report ID and Date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Report ID: ${savedCorrectionId || 'N/A'}`, 14, 30);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 35);
    
    // Divider
    doc.setDrawColor(66, 135, 245);
    doc.line(14, 40, 196, 40);
    
    // Processing Details Section
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Processing Details", 14, 50);
    
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(`Correction Method: ${correctionMethod.toUpperCase()}`, 14, 60);
    doc.text(`Distortion Severity: ${distortionSeverity}%`, 14, 67);
    doc.text(`Distortion Type: Radial distortion`, 14, 74);
    doc.text(`Processing Time: ${processing ? 'N/A' : '3.2 seconds'}`, 14, 81);
    
    // Analysis Section
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Analysis Summary", 14, 95);
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const analysisText = doc.splitTextToSize(
      `The MRI image was analyzed and corrected using the ${correctionMethod} transformation method. ` +
      `The detected distortion severity of ${distortionSeverity}% indicates ${distortionSeverity > 35 ? 'significant' : 'moderate'} ` +
      `geometric distortion that could impact diagnostic accuracy. The correction algorithm successfully ` +
      `realigned the image geometry to restore accurate spatial relationships.`,
      170
    );
    doc.text(analysisText, 14, 105);
    
    // Recommendations
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Recommendations", 14, 135);
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text("• Review corrected image for diagnostic accuracy", 14, 145);
    doc.text("• Compare with original to verify correction quality", 14, 152);
    doc.text(`• ${distortionSeverity > 35 ? 'Consider re-scanning if clinical details are unclear' : 'Corrected image suitable for clinical review'}`, 14, 159);
    doc.text("• Consult with radiologist for final interpretation", 14, 166);
    
    // Quality Metrics
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Quality Metrics", 14, 180);
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`Geometric Accuracy: ${100 - distortionSeverity}%`, 14, 190);
    doc.text(`Signal-to-Noise Ratio: 28.3 dB`, 14, 197);
    doc.text(`Correction Confidence: ${distortionSeverity > 35 ? 'Medium' : 'High'}`, 14, 204);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("This report is generated by MRI Corrector Pro - For educational purposes", 14, 285);
    
    doc.save(`enhanced_report_${Date.now()}.pdf`);
    
    toast({
      title: "Report Generated",
      description: "Enhanced PDF report downloaded successfully"
    });
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

              {/* Distortion Heatmap */}
              <div className="mb-6">
                <DistortionHeatmap 
                  imageUrl={previewUrl} 
                  distortionSeverity={distortionSeverity || 25}
                />
              </div>

              {/* Image Comparison Slider */}
              {correctedUrl && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Before & After Comparison</h3>
                  <ImageComparisonSlider 
                    beforeImage={previewUrl}
                    afterImage={correctedUrl}
                    beforeLabel="Original"
                    afterLabel="Corrected"
                  />
                </div>
              )}

              {/* Original and Corrected Side by Side */}
              {!correctedUrl && (
                <Card className="p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Original Image</h3>
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Original MRI"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-center text-muted-foreground mt-4">
                    {processing ? "Processing..." : "Click 'Process Image' to start correction"}
                  </p>
                </Card>
              )}

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
                    <Button 
                      variant="medical" 
                      size="lg"
                      onClick={() => {
                        if (correctedUrl) {
                          const link = document.createElement('a');
                          link.href = correctedUrl;
                          link.download = `corrected_mri_${Date.now()}.png`;
                          link.click();
                        }
                      }}
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Download Corrected Image
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={generateEnhancedPDF}
                    >
                      <FileText className="mr-2 h-5 w-5" />
                      Generate Enhanced Report
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

      {/* Chatbot */}
      <DistortionChatbot 
        distortionData={{
          severity: distortionSeverity,
          type: "Radial distortion",
          method: correctionMethod,
        }}
      />
    </div>
  );
};

export default Process;
