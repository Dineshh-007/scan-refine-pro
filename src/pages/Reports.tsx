import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, ArrowLeft, FileText, Download, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const Reports = () => {
  const sampleReports = [
    {
      id: 1,
      date: "2025-01-29",
      method: "Bilinear Transformation",
      severity: "35%",
      status: "Completed",
    },
    {
      id: 2,
      date: "2025-01-28",
      method: "AI-Based Correction",
      severity: "42%",
      status: "Completed",
    },
    {
      id: 3,
      date: "2025-01-27",
      method: "Polynomial Mapping",
      severity: "28%",
      status: "Completed",
    },
  ];

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

          <div className="space-y-4">
            {sampleReports.map((report) => (
              <Card key={report.id} className="p-6 hover:shadow-[var(--shadow-medical)] transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <FileText className="h-12 w-12 text-primary" />
                    <div>
                      <h3 className="text-xl font-semibold mb-1">
                        Report #{report.id}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {report.date}
                        </span>
                        <span>Method: {report.method}</span>
                        <span>Severity: {report.severity}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-600 text-sm font-medium">
                      {report.status}
                    </span>
                    <Button variant="medical">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
