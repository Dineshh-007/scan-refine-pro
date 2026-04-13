import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, ArrowLeft, FileText, Download, Calendar, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { jsPDF } from "jspdf";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Correction {
  id: string;
  created_at: string;
  correction_method: string;
  distortion_severity: string;
  distortion_type: string | null;
  processing_time_ms: number | null;
  notes: string | null;
}

const Reports = () => {
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCorrections();
  }, []);

  const fetchCorrections = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        toast({
          title: "Authentication Required",
          description: "Please sign in to view your reports",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from('corrections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching corrections:', error);
        toast({
          title: "Error",
          description: "Failed to load reports",
          variant: "destructive"
        });
        return;
      }

      setCorrections(data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = (report: Correction) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const now = new Date();
    const scanDate = new Date(report.created_at);

    // ── Utility helpers ────────────────────────────────────────────────────
    const sectionTitle = (text: string, y: number) => {
      doc.setFontSize(13);
      doc.setTextColor(37, 99, 235);       // blue-600
      doc.setFont("helvetica", "bold");
      doc.text(text, 14, y);
      doc.setDrawColor(186, 230, 253);     // blue-200
      doc.setLineWidth(0.4);
      doc.line(14, y + 2, pageWidth - 14, y + 2);
      doc.setFont("helvetica", "normal");
    };

    const labelValue = (label: string, value: string, x: number, y: number) => {
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);     // slate-500
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, x, y);
      doc.setTextColor(30, 41, 59);        // slate-800
      doc.setFont("helvetica", "normal");
      doc.text(value, x + 52, y);
    };

    // Severity → correction quality score
    const severityScore: Record<string, number> = {
      low: 96, mild: 90, moderate: 78, high: 62, severe: 48,
    };
    const score = severityScore[report.distortion_severity?.toLowerCase()] ?? 80;
    const scoreLabel = score >= 90 ? "Excellent" : score >= 75 ? "Good" : score >= 60 ? "Moderate" : "Needs Review";

    // Recommendations based on severity
    const recommendations: Record<string, string[]> = {
      low:      ["Images are well within diagnostic quality standards.", "No additional processing required.", "Schedule routine follow-up as clinically indicated."],
      mild:     ["Images are suitable for diagnostic use.", "Minor residual distortion may be present at edges.", "Consider repeat scan if findings are inconclusive."],
      moderate: ["Review corrected images with a radiologist before use.", "Bilinear correction applied — polynomial method may improve quality.", "Document distortion history in patient record."],
      high:     ["Images should be reviewed carefully before clinical decisions.", "Re-scan recommended if feasible.", "Consult radiology for quality validation."],
      severe:   ["Significant distortion detected — clinical use with caution.", "Re-scan strongly recommended.", "Refer to specialist for further assessment."],
    };
    const recs = recommendations[report.distortion_severity?.toLowerCase()] ?? recommendations["moderate"];

    // ── Banner ───────────────────────────────────────────────────────────────
    doc.setFillColor(37, 99, 235);          // blue-600
    doc.rect(0, 0, pageWidth, 28, "F");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("MRI Distortion Correction Report", 14, 13);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("MRI Corrector Pro  •  Confidential Medical Document", 14, 22);

    let y = 38;

    // ── Report Information ───────────────────────────────────────────────────
    sectionTitle("Report Information", y); y += 9;
    labelValue("Report ID",       report.id,                                          14, y); y += 6;
    labelValue("Generated On",    now.toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" }), 14, y); y += 6;
    labelValue("Generated At",    now.toLocaleTimeString("en-IN"),                    14, y); y += 6;
    labelValue("Status",          "Completed ✓",                                      14, y); y += 10;

    // ── Patient / Session Info ───────────────────────────────────────────────
    sectionTitle("Scan / Session Details", y); y += 9;
    labelValue("Session ID",      report.id.slice(0, 16).toUpperCase(),               14, y); y += 6;
    labelValue("Scan Date",       scanDate.toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" }), 14, y); y += 6;
    labelValue("Scan Time",       scanDate.toLocaleTimeString("en-IN"),               14, y); y += 6;
    labelValue("Modality",        "MRI (Magnetic Resonance Imaging)",                 14, y); y += 6;
    labelValue("Image Format",    "Standard MRI Scan",                                14, y); y += 10;

    // ── Processing Details ───────────────────────────────────────────────────
    sectionTitle("Processing Details", y); y += 9;
    labelValue("Correction Method",    report.correction_method,                      14, y); y += 6;
    labelValue("Distortion Type",      report.distortion_type || "Not specified",     14, y); y += 6;
    labelValue("Distortion Severity",  report.distortion_severity,                    14, y); y += 6;
    labelValue("Processing Time",
      report.processing_time_ms
        ? `${(report.processing_time_ms / 1000).toFixed(2)} seconds`
        : "Not recorded",                                                              14, y); y += 6;
    labelValue("Algorithm Version",    "v2.4.1 (AI-Enhanced)",                        14, y); y += 10;

    // ── Quality Assessment ───────────────────────────────────────────────────
    sectionTitle("Quality Assessment", y); y += 9;

    // Score bar
    doc.setFillColor(226, 232, 240);        // gray-200
    doc.roundedRect(14, y, 130, 8, 4, 4, "F");
    const barColor = score >= 90 ? [34,197,94] : score >= 75 ? [234,179,8] : score >= 60 ? [249,115,22] : [239,68,68];
    doc.setFillColor(barColor[0], barColor[1], barColor[2]);
    doc.roundedRect(14, y, (130 * score) / 100, 8, 4, 4, "F");
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text(`${score}% — ${scoreLabel}`, 150, y + 6);
    y += 14;

    labelValue("Overall Result",   scoreLabel,                         14, y); y += 6;
    labelValue("Confidence Level", score >= 80 ? "High" : "Moderate",  14, y); y += 10;

    // ── Recommendations ──────────────────────────────────────────────────────
    sectionTitle("Clinical Recommendations", y); y += 9;
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    recs.forEach((rec, i) => {
      doc.text(`${i + 1}. ${rec}`, 16, y);
      y += 6;
    });
    y += 4;

    // ── Notes ────────────────────────────────────────────────────────────────
    if (report.notes) {
      sectionTitle("Additional Notes", y); y += 9;
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      const notesLines = doc.splitTextToSize(report.notes, 170);
      doc.text(notesLines, 14, y);
      y += notesLines.length * 6 + 6;
    }

    // ── Disclaimer ───────────────────────────────────────────────────────────
    if (y < 260) y = 260;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(14, y, pageWidth - 14, y);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      "This report is for informational purposes only and does not constitute a medical diagnosis.",
      14, y + 6
    );
    doc.text(
      "Always consult a qualified radiologist or physician for clinical interpretation.",
      14, y + 11
    );
    doc.text(
      `Generated by MRI Corrector Pro  •  Page 1 of 1  •  ${now.toLocaleDateString()}`,
      14, y + 16
    );

    doc.save(`MRI_Report_${report.id.slice(0, 8)}_${scanDate.toLocaleDateString('en-CA')}.pdf`);

    toast({
      title: "Report Downloaded",
      description: "Full PDF report downloaded successfully",
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
              <span className="text-xl font-bold">Correction Reports</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Correction Reports</h1>
            <p className="text-muted-foreground">
              View and download detailed correction reports from your MRI processing history
            </p>
          </div>

          {loading ? (
            <Card className="p-12">
              <div className="text-center text-muted-foreground">
                <p>Loading your reports...</p>
              </div>
            </Card>
          ) : corrections.length === 0 ? (
            <Card className="p-12">
              <div className="text-center text-muted-foreground">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No reports yet</p>
                <p className="text-sm">Process your first MRI image to create a report</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {corrections.map((report) => (
                <Card key={report.id} className="p-6 hover:shadow-[var(--shadow-medical)] transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <FileText className="h-12 w-12 text-primary" />
                      <div>
                        <h3 className="text-xl font-semibold mb-1">
                          Report #{report.id.slice(0, 8)}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(report.created_at).toLocaleDateString()}
                          </span>
                          <span>Method: {report.correction_method}</span>
                          <span>Severity: {report.distortion_severity}</span>
                          {report.processing_time_ms && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {(report.processing_time_ms / 1000).toFixed(2)}s
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-600 text-sm font-medium">
                        Completed
                      </span>
                      <Button 
                        variant="medical"
                        onClick={() => generatePDF(report)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
