import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, ArrowLeft, ChevronDown, Phone, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Educate = () => {
  const educationalTopics = [
    {
      id: "1",
      title: "What is MRI Distortion?",
      simple: "MRI distortion occurs when magnetic field irregularities cause images to appear warped or skewed.",
      detailed: "MRI distortion is a systematic deviation from the true geometric representation of the object being imaged. It occurs due to magnetic field inhomogeneities, gradient non-linearities, and patient-specific factors. The main types include geometric distortion (spatial warping), intensity distortion (signal variations), and susceptibility artifacts (caused by air-tissue interfaces). These distortions can significantly impact diagnostic accuracy, surgical planning, and radiation therapy applications."
    },
    {
      id: "2",
      title: "Types of MRI Distortions",
      simple: "Common types include barrel distortion (edges curve outward), pincushion distortion (edges curve inward), and wave distortion (irregular patterns).",
      detailed: "1. Barrel Distortion: Caused by gradient non-linearity where image magnification increases with distance from the center, making straight lines appear to bulge outward. Common in wide field-of-view imaging.\n\n2. Pincushion Distortion: The inverse of barrel distortion, where image compression increases with distance from center, making edges appear pinched inward.\n\n3. Wave/S-Distortion: Results from complex field inhomogeneities creating irregular, wave-like patterns across the image.\n\n4. Chemical Shift Artifacts: Occurs due to different resonance frequencies of fat and water protons, causing spatial misregistration.\n\n5. Susceptibility Artifacts: Caused by magnetic field disturbances at interfaces between tissues with different magnetic properties."
    },
    {
      id: "3",
      title: "Why Does Distortion Matter?",
      simple: "Distorted MRI images can lead to misdiagnosis, incorrect measurements, and inaccurate treatment planning.",
      detailed: "MRI distortion has critical implications across multiple medical applications:\n\n• Surgical Planning: Distorted images can lead to incorrect localization of lesions, affecting surgical approach and outcomes.\n\n• Radiation Therapy: Geometric accuracy is crucial for targeting tumors while sparing healthy tissue. Even small distortions (2-3mm) can significantly impact treatment efficacy.\n\n• Diagnostic Accuracy: Distortion can mask small lesions, alter apparent lesion sizes, and create false positives or negatives.\n\n• Stereotactic Procedures: Procedures requiring precise spatial coordinates (like biopsies or ablations) rely on accurate imaging.\n\n• Longitudinal Studies: Comparing scans over time requires consistent geometry to track disease progression accurately."
    },
    {
      id: "4",
      title: "Correction Methods",
      simple: "Various mathematical and AI-based techniques can correct distorted MRI images to restore accurate geometry.",
      detailed: "Modern correction approaches include:\n\n1. Polynomial Mapping: Uses mathematical functions (2nd-4th order polynomials) to model and reverse distortion patterns. Effective for smooth, predictable distortions.\n\n2. Bilinear Transformation: Applies linear interpolation in two dimensions, suitable for moderate distortions with known reference points.\n\n3. Grid-Based Warping: Uses control point grids to map distorted coordinates to corrected positions, offering flexibility for complex distortions.\n\n4. AI-Based Correction: Deep learning models trained on paired distorted/corrected images can learn complex distortion patterns and apply sophisticated corrections.\n\n5. Gradient Non-linearity Correction: Manufacturer-specific corrections based on known gradient characteristics.\n\n6. Phase-Based Methods: Utilize phase information in MRI data to estimate and correct field inhomogeneities."
    },
    {
      id: "5",
      title: "When to Seek Medical Consultation",
      simple: "If you notice unusual findings in your MRI or have concerns about image quality, consult your radiologist or physician.",
      detailed: "Seek immediate medical consultation if:\n\n• Your MRI report mentions significant artifacts or distortions that limit interpretation\n• There's uncertainty about lesion location or characteristics\n• You're undergoing treatment planning (surgery or radiation) and image quality is questioned\n• You experience symptoms that don't correlate with imaging findings\n• Multiple scans show inconsistent results\n• You're referred for repeat imaging due to quality issues\n\nYour healthcare team can:\n• Order additional sequences or rescans with optimized parameters\n• Apply advanced post-processing techniques\n• Correlate findings with other imaging modalities (CT, PET)\n• Provide clinical context to interpret artifacts\n• Recommend specialized imaging centers for challenging cases"
    }
  ];

  const faqs = [
    {
      question: "Can distorted MRI images be fixed?",
      answer: "Yes, many types of MRI distortions can be corrected using advanced image processing techniques. Our platform offers multiple correction methods including polynomial mapping, bilinear transformation, and AI-based corrections. The effectiveness depends on the type and severity of distortion, but most geometric distortions can be significantly improved."
    },
    {
      question: "How accurate are the corrected images?",
      answer: "Correction accuracy varies based on the method used and distortion type. Polynomial and grid-based methods typically achieve sub-millimeter accuracy for moderate distortions. AI-based methods can handle more complex patterns and often provide accuracy within 1-2mm for severe distortions. However, corrected images should always be reviewed by qualified medical professionals before clinical use."
    },
    {
      question: "Is MRI distortion common?",
      answer: "Some degree of distortion exists in all MRI scans due to inherent physical limitations of magnetic fields and gradients. However, clinically significant distortion (affecting diagnosis or treatment) is less common and depends on factors like field strength, imaging parameters, anatomical region, and scanner quality. Modern scanners and protocols minimize distortion, but certain scenarios (wide field-of-view, areas near metal implants, or air-tissue interfaces) are more susceptible."
    },
    {
      question: "Can I use corrected images for medical decisions?",
      answer: "Corrected images can be valuable tools, but should not replace professional medical interpretation. Always have corrected images reviewed and validated by a qualified radiologist or physician before using them for clinical decisions. The correction process itself may introduce artifacts or uncertainties that require expert assessment."
    },
    {
      question: "What causes MRI distortions?",
      answer: "MRI distortions arise from multiple sources: (1) Gradient non-linearities - inherent imperfections in gradient coils, (2) B0 field inhomogeneities - variations in the main magnetic field, (3) Susceptibility effects - tissue interfaces with different magnetic properties, (4) Chemical shift - different resonance frequencies of tissue components, (5) Patient motion - movement during scanning, and (6) Hardware limitations - coil geometry and performance."
    },
    {
      question: "How long does the correction process take?",
      answer: "Processing time varies by method and image size. Simple polynomial corrections typically complete in 1-3 minutes, while advanced AI-based corrections may take 5-10 minutes for high-resolution images. Grid-based warping methods fall in between at 3-5 minutes. Our platform processes images efficiently to provide timely results."
    }
  ];

  const emergencyContacts = [
    { name: "Emergency Medical Services", number: "112", description: "Immediate life-threatening emergencies" },
    { name: "National Health Helpline", number: "1-800-232-4636", description: "24/7 medical advice and guidance" },
    { name: "Poison Control", number: "1-800-222-1222", description: "Poisoning emergencies and information" },
    { name: "Mental Health Crisis Line", number: "988", description: "24/7 mental health crisis support" },
    { name: "Radiology Consultation Hotline", number: "1-877-RAD-INFO", description: "Questions about imaging procedures" },
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
              <span className="text-xl font-bold">Education Center</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Intro */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Learn About MRI Distortion</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Comprehensive information to help you understand MRI distortions, their causes, 
              and how modern correction techniques can improve diagnostic accuracy.
            </p>
          </div>

          {/* Educational Topics */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              Interactive Learning Modules
            </h2>
            <Accordion type="single" collapsible className="space-y-4">
              {educationalTopics.map((topic) => (
                <AccordionItem 
                  key={topic.id} 
                  value={topic.id}
                  className="border rounded-lg px-4 hover:bg-muted/50 transition-colors"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    <span className="text-lg font-semibold">{topic.title}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 pt-2">
                    <div className="space-y-4">
                      <div className="bg-primary/5 p-4 rounded-lg border-l-4 border-primary">
                        <p className="font-medium text-sm text-primary mb-2">Quick Overview</p>
                        <p className="text-sm">{topic.simple}</p>
                      </div>
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <p className="font-medium text-sm text-foreground mb-2">Detailed Information</p>
                        <p className="text-sm leading-relaxed whitespace-pre-line">{topic.detailed}</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>

          {/* FAQ Section */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-accent" />
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`faq-${index}`}
                  className="border rounded-lg px-4 hover:bg-muted/50 transition-colors"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    <span className="font-medium">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 pt-2">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>

          {/* Emergency Contacts */}
          <Card className="p-8 bg-gradient-to-br from-red-50/50 to-orange-50/50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200 dark:border-red-900">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-red-700 dark:text-red-400">
              <Phone className="h-6 w-6" />
              Emergency Medical Contacts
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Save these important numbers for medical emergencies and consultations
            </p>
            <div className="space-y-4">
              {emergencyContacts.map((contact, index) => (
                <Card key={index} className="p-5 hover:shadow-lg transition-shadow bg-card">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{contact.name}</h3>
                      <p className="text-sm text-muted-foreground">{contact.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-primary">{contact.number}</span>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => window.open(`tel:${contact.number}`, '_self')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div className="mt-6 p-4 bg-yellow-100/50 dark:bg-yellow-900/20 rounded-lg border border-yellow-300 dark:border-yellow-700">
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
                ⚠️ In case of a medical emergency, always call 108 first for immediate assistance.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Educate;
