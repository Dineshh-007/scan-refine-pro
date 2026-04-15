import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, X, Wifi, WifiOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface DistortionChatbotProps {
  distortionData?: {
    severity: number;
    type: string;
    method: string;
  };
}

// ─── Local Knowledge Engine ───────────────────────────────────────────────────
// Provides intelligent MRI-domain responses when the edge function is unavailable.

function generateLocalResponse(
  message: string,
  distortionData?: DistortionChatbotProps["distortionData"]
): string {
  const q = message.toLowerCase();
  const dtype = distortionData?.type?.toLowerCase() ?? "";
  const severity = distortionData?.severity ?? 0;
  const method = distortionData?.method ?? "";

  const severityLabel =
    severity >= 70 ? "high" : severity >= 40 ? "moderate" : "low";
  const severityDesc =
    severity >= 70
      ? "significant distortion is present that requires prompt correction before clinical use"
      : severity >= 40
      ? "moderate distortion exists — correction is recommended for accurate measurements"
      : "distortion levels are mild and within acceptable limits for most diagnostic purposes";

  // ── Greetings ───────────────────────────────────────────────────────────────
  if (/^(hi|hello|hey|good|greet|howdy)/i.test(q)) {
    return `Hello! I'm your MRI distortion analysis assistant. I'm here to help you understand distortion patterns, correction methods, and clinical implications. ${
      distortionData
        ? `I can see you have a scan with **${dtype} distortion** at ${severity}% severity using the **${method}** method. What would you like to know?`
        : "Upload an MRI image and I'll analyse its distortion patterns. What would you like to know?"
    }`;
  }

  // ── What can you do / help ───────────────────────────────────────────────────
  if (/what (can|do) you|help|capabilit|feature/i.test(q)) {
    return `I can help you with:\n\n• **Distortion types** – barrel, pincushion, wave/field warp\n• **Severity interpretation** – what the percentages mean clinically\n• **Correction methods** – bilinear, polynomial, AI-based\n• **Comparison guidance** – how to read the before/after overlay\n• **Clinical significance** – when distortion matters for diagnosis\n• **Recommendations** – which correction method to use for your scan\n\nJust ask me anything about your MRI scan!`;
  }

  // ── Barrel distortion ───────────────────────────────────────────────────────
  if (/barrel/i.test(q) || (dtype === "barrel" && /distortion|type|what/i.test(q))) {
    return `**Barrel Distortion** occurs when the image appears to bulge outward from the centre, similar to the curved surface of a barrel.\n\n**Cause:** Non-linearities in the gradient magnetic field, most common with wide field-of-view sequences or at the periphery of the bore.\n\n**Clinical impact:** Anatomical structures near the edges of the image appear stretched and displaced. This can affect measurements of organ size, tumour margins, and surgical planning.\n\n${
      distortionData
        ? `Your scan shows **${severityLabel} barrel distortion (${severity}%)** — ${severityDesc}.`
        : "Barrel distortion is typically corrected using polynomial or AI-based methods."
    }`;
  }

  // ── Pincushion distortion ───────────────────────────────────────────────────
  if (/pincushion|pin cushion|pin-cushion/i.test(q) || (dtype === "pincushion" && /distortion|type|what/i.test(q))) {
    return `**Pincushion Distortion** is the opposite of barrel distortion — the image appears to pinch inward at the edges, as if pulled toward a pin.\n\n**Cause:** Typically caused by gradient field inhomogeneities or receiver coil positioning issues.\n\n**Clinical impact:** Peripheral anatomy appears compressed and inward-shifted. Measurements of structures near the image border will be underestimated.\n\n${
      distortionData
        ? `Your scan shows **${severityLabel} pincushion distortion (${severity}%)** — ${severityDesc}.`
        : "Polynomial correction is generally effective for pincushion distortion."
    }`;
  }

  // ── Wave / field warp distortion ────────────────────────────────────────────
  if (/wave|warp|field|ripple/i.test(q) || (dtype === "wave" && /distortion|type|what/i.test(q))) {
    return `**Wave/Field Warp Distortion** creates irregular, ripple-like deformations across the image — structures appear wavy or undulating.\n\n**Cause:** Complex B0 field inhomogeneities, susceptibility artefacts near air–tissue interfaces (sinuses, lungs), or motion during acquisition.\n\n**Clinical impact:** The most complex to correct. Anatomical boundaries become unclear, making segmentation and measurement unreliable.\n\n${
      distortionData
        ? `Your scan shows **${severityLabel} wave distortion (${severity}%)** — ${severityDesc}. AI-based correction is strongly recommended.`
        : "Wave distortion requires AI-based or fieldmap-assisted correction for best results."
    }`;
  }

  // ── Severity / percentage ───────────────────────────────────────────────────
  if (/severity|percent|score|level|how bad|how serious|rating/i.test(q)) {
    if (!distortionData) {
      return "Upload an MRI scan to get a personalised severity assessment. In general:\n\n• **0–40%** — Mild: acceptable for most clinical uses\n• **40–70%** — Moderate: correction recommended before measurements\n• **70–100%** — Severe: correction required before any clinical use\n\nThe overlay on your image uses colour coding: 🔴 Red = high distortion, 🟡 Yellow = moderate, 🟢 Green = low.";
    }
    return `Your current scan has a distortion severity of **${severity}%**, which is classified as **${severityLabel}**.\n\nThis means ${severityDesc}.\n\n${
      severity >= 70
        ? "⚠️ I strongly recommend applying correction before using this image for clinical measurements or surgical planning."
        : severity >= 40
        ? "📋 Correction is advisable if you need precise anatomical measurements."
        : "✅ You may proceed with standard clinical review, though correction will improve accuracy."
    }`;
  }

  // ── Correction methods ──────────────────────────────────────────────────────
  if (/correct|fix|method|bilinear|polynomial|ai.based|algorithm|technique/i.test(q)) {
    const methodInfo: Record<string, string> = {
      bilinear:
        "**Bilinear Correction** uses linear interpolation between known reference points to remap pixels. It is fast, reliable for mild distortions, and computationally inexpensive. Best for barrel and pincushion distortions with severity below 40%.",
      polynomial:
        "**Polynomial Correction** fits a polynomial transformation model (typically 3rd–5th order) to the distortion field. It handles moderate-to-severe barrel and pincushion distortions well and is the industry standard for MRI geometric correction.",
      "ai-based":
        "**AI-Based Correction** uses a trained deep learning model to predict and correct complex distortions including wave/field warps. It performs best on irregular patterns that polynomial methods struggle with. It is the most computationally intensive but produces the highest accuracy.",
    };

    if (method && methodInfo[method.toLowerCase()]) {
      return `Your scan used **${method}** correction.\n\n${methodInfo[method.toLowerCase()]}\n\nWould you like to know how this compares to other correction methods?`;
    }

    return `There are three main correction methods:\n\n${Object.values(methodInfo).join("\n\n")}\n\n**Recommendation:** \n• Severity < 40% → Bilinear\n• Severity 40–70% → Polynomial\n• Severity > 70% or wave distortion → AI-Based`;
  }

  // ── Overlay / heatmap colours ───────────────────────────────────────────────
  if (/overlay|colour|color|red|yellow|green|heatmap|heat map|map/i.test(q)) {
    return `The **distortion heatmap overlay** uses a traffic-light colour scheme:\n\n🔴 **Red** — High distortion (>70%): Significant geometric displacement. Measurements in red areas are unreliable without correction.\n\n🟡 **Yellow** — Moderate distortion (40–70%): Noticeable displacement. Clinical measurements should be made cautiously.\n\n🟢 **Green** — Low distortion (<40%): Minimal displacement, generally acceptable for diagnosis.\n\nThe corrected panel on the right shows how the image looks after applying the selected correction algorithm.`;
  }

  // ── Comparison / before-after ───────────────────────────────────────────────
  if (/compar|before|after|original|corrected|differ|side|panel/i.test(q)) {
    return `The **side-by-side comparison** allows you to evaluate the correction quality:\n\n**Left panel (Original):** The raw MRI output with overlay showing distortion zones.\n\n**Right panel (Corrected):** The geometrically corrected version using your selected algorithm.\n\n**What to look for:**\n• Straight lines that were curved should now appear straight\n• Anatomical landmarks should be in their expected positions\n• The overall image proportions should appear natural\n\n${
      distortionData
        ? `With your ${severity}% ${dtype} distortion, the ${method} correction should show visible improvement in the peripheral regions.`
        : "Upload a scan to see the comparison in action."
    }`;
  }

  // ── Clinical significance / when matters ─────────────────────────────────────
  if (/clinical|diagnos|patient|safe|matter|important|signific|treatment|surgery|plan/i.test(q)) {
    return `**Clinical Significance of MRI Distortion:**\n\nMRI geometric distortion is critical in several scenarios:\n\n🧠 **Neurosurgery planning** — Even 1–2mm displacement can affect brain surgery targets. All images must be corrected.\n\n📏 **Radiation therapy** — Distorted images can shift radiation dose away from the tumour margin. Correction is mandatory.\n\n📐 **Bone/joint measurements** — Orthopaedic angle measurements are unreliable in high-distortion peripheral zones.\n\n🔬 **Research & volumetry** — Brain volume and lesion size measurements require corrected images.\n\n${
      distortionData
        ? `With your current ${severityLabel} distortion (${severity}%), ${
            severity >= 40
              ? "clinical measurements should only be made on the corrected image."
              : "the distortion is within acceptable limits, though corrected images will yield better results."
          }`
        : ""
    }`;
  }

  // ── Recommendation ─────────────────────────────────────────────────────────
  if (/recommend|suggest|should i|best|advise|what next|next step/i.test(q)) {
    if (!distortionData) {
      return "Upload an MRI image first to get a personalised recommendation. I'll analyse the distortion type and severity and suggest the most appropriate correction method.";
    }
    const recommended =
      severity >= 70 ? "AI-Based" : severity >= 40 ? "Polynomial" : "Bilinear";
    return `Based on your scan analysis:\n\n📊 **Distortion type:** ${dtype}\n📈 **Severity:** ${severity}% (${severityLabel})\n🔧 **Current method:** ${method}\n\n✅ **My recommendation:**${
      method.toLowerCase() === recommended.toLowerCase()
        ? ` You're already using the most appropriate method (**${method}**) for this severity level. The correction results should be optimal.`
        : ` Consider switching to **${recommended}** correction for better results at this severity level.`
    }\n\n${severityDesc.charAt(0).toUpperCase() + severityDesc.slice(1)}.`;
  }

  // ── Thank you ───────────────────────────────────────────────────────────────
  if (/thank|thanks|great|perfect|good job|awesome|helpful/i.test(q)) {
    return "You're welcome! Feel free to ask any other questions about your MRI scan or distortion analysis. I'm here to help. 😊";
  }

  // ── Default ─────────────────────────────────────────────────────────────────
  return `I understand you're asking about: "${message}"\n\nAs your MRI distortion assistant, I can help with:\n\n• Understanding distortion types (barrel, pincushion, wave)\n• Interpreting severity scores and heatmap colours\n• Choosing the right correction method\n• Understanding clinical significance\n• Reading the before/after comparison\n\n${
    distortionData
      ? `Your current scan shows **${dtype} distortion** at **${severity}%** severity. Would you like me to explain what that means, or how the **${method}** correction works?`
      : "Try asking about a specific distortion type or upload an MRI scan to get started!"
  }`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const DistortionChatbot = ({ distortionData }: DistortionChatbotProps) => {
  const [isOpen, setIsOpen]   = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your MRI distortion analysis assistant. I can explain distortion types, severity scores, correction methods, and clinical significance. The heatmap overlay shows: 🔴 Red = high distortion, 🟡 Yellow = moderate, 🟢 Green = low. How can I help you today?",
    },
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [aiMode,  setAiMode]  = useState<"cloud" | "local">("cloud");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setInput("");
    setLoading(true);

    // ── Try cloud edge function first (if not already marked as unavailable) ──
    if (aiMode === "cloud") {
      try {
        const { data, error } = await supabase.functions.invoke("distortion-chat", {
          body: { message: userText, distortionData },
        });

        if (error) throw error;

        if (data?.response) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: data.response },
          ]);
          setLoading(false);
          return;
        }
      } catch (err: any) {
        // Cloud failed — log silently and fall through to local
        console.warn(
          "Edge function unavailable, switching to local AI:",
          err?.message ?? err
        );
        setAiMode("local");
      }
    }

    // ── Local AI fallback (always works, no network needed) ───────────────────
    // Simulate a short thinking delay so it feels natural
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 600));

    const localReply = generateLocalResponse(userText, distortionData);
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: localReply },
    ]);
    setLoading(false);
  };

  // ── Collapsed FAB ──────────────────────────────────────────────────────────
  if (!isOpen) {
    return (
      <Button
        id="chatbot-toggle"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-50"
        variant="medical"
        size="icon"
        aria-label="Open distortion assistant"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  // ── Expanded chat ──────────────────────────────────────────────────────────
  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[520px] shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary to-accent text-white rounded-t-lg flex-shrink-0">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <div>
            <h3 className="font-semibold text-sm leading-none">Distortion Assistant</h3>
            <p className="text-[10px] opacity-80 mt-0.5 flex items-center gap-1">
              {aiMode === "cloud" ? (
                <><Wifi className="h-2.5 w-2.5" /> Cloud AI</>
              ) : (
                <><WifiOff className="h-2.5 w-2.5" /> Local Knowledge Base</>
              )}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-white/20 h-8 w-8"
          aria-label="Close chatbot"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted rounded-bl-sm"
                }`}
                // Render markdown-style **bold** as actual bold
                dangerouslySetInnerHTML={{
                  __html: msg.content
                    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                    .replace(/\n/g, "<br/>"),
                }}
              />
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            id="chatbot-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about distortions…"
            disabled={loading}
            className="flex-1"
          />
          <Button
            id="chatbot-send"
            type="submit"
            size="icon"
            variant="medical"
            disabled={loading || !input.trim()}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
};
