import { useEffect, useRef, useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Phase = "INHALE" | "HOLD" | "EXHALE" | "IDLE";

const PHASES: { phase: Phase; duration: number; label: string; sub: string }[] = [
  { phase: "INHALE", duration: 4, label: "Breathe In", sub: "Inhale slowly through your nose" },
  { phase: "HOLD",   duration: 7, label: "Hold",       sub: "Keep your lungs full, stay calm" },
  { phase: "EXHALE", duration: 8, label: "Release",    sub: "Exhale completely through your mouth" },
];

// ─── Phase colours ─────────────────────────────────────────────────────────────
const phaseStyle: Record<Phase, { ring: string; liquid: string; glow: string; bg: string; text: string }> = {
  INHALE: {
    ring:   "#38bdf8",
    liquid: "from-sky-400 to-cyan-500",
    glow:   "rgba(56,189,248,0.35)",
    bg:     "from-sky-900/30 via-cyan-900/20 to-background",
    text:   "text-sky-300",
  },
  HOLD: {
    ring:   "#818cf8",
    liquid: "from-indigo-400 to-violet-500",
    glow:   "rgba(129,140,248,0.35)",
    bg:     "from-indigo-900/30 via-violet-900/20 to-background",
    text:   "text-indigo-300",
  },
  EXHALE: {
    ring:   "#34d399",
    liquid: "from-teal-400 to-emerald-500",
    glow:   "rgba(52,211,153,0.35)",
    bg:     "from-teal-900/30 via-emerald-900/20 to-background",
    text:   "text-teal-300",
  },
  IDLE: {
    ring:   "#64748b",
    liquid: "from-slate-400 to-slate-500",
    glow:   "rgba(100,116,139,0.2)",
    bg:     "from-slate-900/10 via-slate-800/10 to-background",
    text:   "text-slate-400",
  },
};

// ─── Ring constants ────────────────────────────────────────────────────────────
const RING_R   = 110;
const RING_C   = 2 * Math.PI * RING_R; // circumference

const GuidedBreathing = () => {
  const [running,      setRunning]      = useState(false);
  const [phaseIdx,     setPhaseIdx]     = useState(0);
  const [secondsLeft,  setSecondsLeft]  = useState(PHASES[0].duration);
  const [fillPct,      setFillPct]      = useState(0);       // 0–100
  const [dashOffset,   setDashOffset]   = useState(RING_C);  // start hidden
  const [labelVisible, setLabelVisible] = useState(true);

  const intervalRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef       = useRef(0);     // seconds elapsed in current phase
  const phaseIdxRef   = useRef(0);

  const currentPhase   = PHASES[phaseIdx];
  const phaseInfo      = phaseStyle[running ? currentPhase.phase : "IDLE"];

  // ─── Clear helpers ──────────────────────────────────────────────────────────
  const clearTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  // ─── Advance to next phase ──────────────────────────────────────────────────
  const advancePhase = useCallback(() => {
    setLabelVisible(false);
    setTimeout(() => {
      setPhaseIdx(prev => {
        const next = (prev + 1) % PHASES.length;
        phaseIdxRef.current = next;
        tickRef.current = 0;
        setSecondsLeft(PHASES[next].duration);
        // animate ring: reset offset instantly, then transition to 0
        setDashOffset(RING_C);
        setTimeout(() => setDashOffset(0), 50);
        // fill logic
        if (PHASES[next].phase === "INHALE")  setFillPct(100);
        if (PHASES[next].phase === "HOLD")    {} // keep filled
        if (PHASES[next].phase === "EXHALE")  setFillPct(0);
        setLabelVisible(true);
        return next;
      });
    }, 300);
  }, []);

  // ─── Start session ──────────────────────────────────────────────────────────
  const startSession = () => {
    phaseIdxRef.current = 0;
    tickRef.current     = 0;
    setPhaseIdx(0);
    setSecondsLeft(PHASES[0].duration);
    setFillPct(100);
    setDashOffset(RING_C);
    setRunning(true);
    // kick off ring animation after a frame
    setTimeout(() => setDashOffset(0), 50);
  };

  // ─── Stop session ───────────────────────────────────────────────────────────
  const stopSession = () => {
    clearTimer();
    setRunning(false);
    setFillPct(0);
    setDashOffset(RING_C);
    setSecondsLeft(PHASES[0].duration);
    setPhaseIdx(0);
  };

  // ─── Tick ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!running) { clearTimer(); return; }

    intervalRef.current = setInterval(() => {
      tickRef.current += 1;
      const dur = PHASES[phaseIdxRef.current].duration;
      setSecondsLeft(dur - tickRef.current);

      if (tickRef.current >= dur) {
        clearTimer();
        advancePhase();
      }
    }, 1000);

    return () => clearTimer();
  }, [running, phaseIdx, advancePhase]);

  // ─── Ring transition duration (matches phase duration) ─────────────────────
  const ringDuration = running ? currentPhase.duration : 0;

  return (
    <section
      className={`relative overflow-hidden py-24 transition-all duration-1000 bg-gradient-to-b ${phaseInfo.bg}`}
      aria-label="Guided Breathing Exercise"
    >
      {/* Ambient orbs */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute -top-20 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-30 animate-[orb1_12s_ease-in-out_infinite]"
          style={{ background: phaseInfo.glow, transition: "background 1.5s ease" }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-20 animate-[orb2_15s_ease-in-out_infinite]"
          style={{ background: phaseInfo.glow, transition: "background 1.5s ease" }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section title */}
        <div className="text-center mb-12">
          <span className="text-xs font-semibold tracking-[0.3em] uppercase text-muted-foreground">
            Wellness · No Login Required
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-3">
            Guided Breathing Exercise
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto text-sm">
            Follow the 4-7-8 technique to calm your mind before or after your scan session.
          </p>
        </div>

        {/* Main Card */}
        <div className="max-w-sm mx-auto flex flex-col items-center gap-8">

          {/* Ring + silhouette */}
          <div className="relative flex items-center justify-center" style={{ width: 300, height: 300 }}>

            {/* Ambient glow behind ring */}
            <div
              className="absolute inset-0 rounded-full blur-2xl opacity-40 transition-all duration-1000 scale-75"
              style={{ background: phaseInfo.glow }}
            />

            {/* Ring timer SVG */}
            <svg
              width="300" height="300"
              viewBox="0 0 300 300"
              className="absolute inset-0"
              aria-hidden="true"
            >
              {/* Track */}
              <circle
                cx="150" cy="150" r={RING_R}
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                className="text-border/40"
              />
              {/* Progress arc */}
              <circle
                cx="150" cy="150" r={RING_R}
                fill="none"
                stroke={phaseInfo.ring}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={RING_C}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 150 150)"
                style={{
                  transition: dashOffset === RING_C
                    ? "stroke-dashoffset 0s, stroke 1.5s ease"
                    : `stroke-dashoffset ${ringDuration}s linear, stroke 1.5s ease`,
                  filter: `drop-shadow(0 0 6px ${phaseInfo.ring})`,
                }}
              />
            </svg>

            {/* Inner content */}
            <div className="relative flex flex-col items-center justify-center w-52 h-52">

              {/* Human silhouette with liquid fill */}
              <div className="relative w-28 h-40 mx-auto">
                {/* SVG silhouette as clip mask */}
                <svg
                  viewBox="0 0 100 140"
                  className="absolute inset-0 w-full h-full"
                  aria-hidden="true"
                >
                  <defs>
                    <clipPath id="body-clip">
                      {/* Head */}
                      <ellipse cx="50" cy="14" rx="13" ry="14" />
                      {/* Neck */}
                      <rect x="44" y="26" width="12" height="8" rx="3" />
                      {/* Torso */}
                      <path d="M28,34 Q50,28 72,34 L76,90 Q50,96 24,90 Z" />
                      {/* Left arm */}
                      <path d="M28,36 Q14,50 16,80 Q20,82 24,80 Q22,52 32,40 Z" />
                      {/* Right arm */}
                      <path d="M72,36 Q86,50 84,80 Q80,82 76,80 Q78,52 68,40 Z" />
                      {/* Left leg */}
                      <path d="M36,88 Q32,112 30,138 Q38,140 40,138 Q42,112 48,90 Z" />
                      {/* Right leg */}
                      <path d="M64,88 Q68,112 70,138 Q62,140 60,138 Q58,112 52,90 Z" />
                    </clipPath>
                  </defs>

                  {/* Body silhouette outline (faint) */}
                  <g clipPath="url(#body-clip)">
                    {/* Background body */}
                    <rect x="0" y="0" width="100" height="140" fill="currentColor" className="text-muted/20" />
                    {/* Liquid fill — animate height via a foreignObject height trick */}
                    <rect
                      x="0"
                      y={140 - (fillPct / 100) * 140}
                      width="100"
                      height={(fillPct / 100) * 140}
                      className={`transition-all ease-in-out`}
                      style={{
                        transitionDuration:
                          running && currentPhase.phase === "INHALE"  ? `${currentPhase.duration}s` :
                          running && currentPhase.phase === "EXHALE"  ? `${currentPhase.duration}s` :
                          "0.5s",
                        fill: phaseInfo.ring,
                        opacity: 0.85,
                        filter: `drop-shadow(0 0 4px ${phaseInfo.ring})`,
                      }}
                    />
                    {/* Ripple wave at fill surface (decorative) */}
                    {running && currentPhase.phase !== "HOLD" && (
                      <ellipse
                        cx="50"
                        cy={140 - (fillPct / 100) * 140}
                        rx="50" ry="4"
                        fill={phaseInfo.ring}
                        opacity="0.4"
                        className="animate-pulse"
                      />
                    )}
                    {/* Glow pulse overlay when HOLD */}
                    {running && currentPhase.phase === "HOLD" && (
                      <rect
                        x="0" y="0" width="100" height="140"
                        fill={phaseInfo.ring}
                        opacity="0.15"
                        className="animate-pulse"
                      />
                    )}
                  </g>

                  {/* Body outline */}
                  <g clipPath="url(#body-clip)" fill="none">
                    <rect x="0" y="0" width="100" height="140" fill="none" />
                  </g>
                  {/* Stroke outline of body shape */}
                  <ellipse cx="50" cy="14" rx="13" ry="14" fill="none" stroke={phaseInfo.ring} strokeWidth="1.5" opacity="0.5" style={{transition:"stroke 1.5s ease"}}/>
                  <path d="M28,34 Q50,28 72,34 L76,90 Q50,96 24,90 Z" fill="none" stroke={phaseInfo.ring} strokeWidth="1.5" opacity="0.5" style={{transition:"stroke 1.5s ease"}}/>
                </svg>
              </div>

              {/* Seconds remaining */}
              <div
                className={`mt-3 text-4xl font-bold tabular-nums transition-colors duration-700 ${phaseInfo.text}`}
              >
                {running ? secondsLeft : "–"}
              </div>
            </div>
          </div>

          {/* Phase label */}
          <div className="text-center h-16 flex flex-col items-center justify-center">
            <p
              className={`text-2xl font-semibold tracking-wide transition-all duration-300 ${phaseInfo.text} ${labelVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
            >
              {running ? currentPhase.label : "Ready?"}
            </p>
            <p
              className={`text-sm text-muted-foreground mt-1 transition-all duration-300 ${labelVisible ? "opacity-100" : "opacity-0"}`}
            >
              {running ? currentPhase.sub : "Press Start to begin a calming 4-7-8 cycle"}
            </p>
          </div>

          {/* Phase indicator pills */}
          <div className="flex gap-3 items-center">
            {PHASES.map((p, i) => (
              <div key={p.phase} className="flex flex-col items-center gap-1">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    running && i === phaseIdx
                      ? "w-8 opacity-100"
                      : "w-3 opacity-30"
                  }`}
                  style={{ background: phaseStyle[p.phase].ring }}
                />
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  {p.phase === "INHALE" ? `${p.duration}s` : p.phase === "HOLD" ? `${p.duration}s` : `${p.duration}s`}
                </span>
              </div>
            ))}
          </div>

          {/* Control button */}
          <button
            onClick={running ? stopSession : startSession}
            className={`
              relative px-10 py-3.5 rounded-full font-semibold text-sm tracking-wide
              transition-all duration-300 outline-none
              ${running
                ? "bg-white/10 border border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
                : "text-white shadow-lg hover:scale-105 active:scale-95"
              }
            `}
            style={!running ? {
              background: `linear-gradient(135deg, #38bdf8, #818cf8)`,
              boxShadow: `0 8px 32px rgba(56,189,248,0.4)`,
            } : {}}
          >
            {running ? "⏹ Stop" : "▶ Start Breathing"}
          </button>

          {/* Technique name badge */}
          <p className="text-xs text-muted-foreground/60 tracking-widest uppercase">
            4 · 7 · 8 · Breathing Technique
          </p>
        </div>
      </div>

      {/* Keyframe styles injected inline */}
      <style>{`
        @keyframes orb1 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(40px,-30px) scale(1.15); }
        }
        @keyframes orb2 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(-30px,20px) scale(1.1); }
        }
      `}</style>
    </section>
  );
};

export default GuidedBreathing;
