import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Brain, Home, UtensilsCrossed, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMacroStore } from "@/hooks/useMacroStore";
import HomeTab from "@/components/macro/HomeTab";
import TrackFoodTab from "@/components/macro/TrackFoodTab";
import TrendsTab from "@/components/macro/TrendsTab";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "home" | "track" | "trends";

const TABS: {
  id: Tab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "home",   label: "Home",       icon: Home            },
  { id: "track",  label: "Track Food", icon: UtensilsCrossed },
  { id: "trends", label: "Trends",     icon: TrendingUp      },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

const MacroTracker = () => {
  const store = useMacroStore();

  const [activeTab,    setActiveTab]    = useState<Tab>("home");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weekOffset,   setWeekOffset]   = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 flex flex-col">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50 flex-shrink-0">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" aria-label="Back to Dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <Brain className="h-7 w-7 text-primary flex-shrink-0" />
          <div>
            <h1 className="text-base font-bold leading-none">Macro Tracker</h1>
            <p className="text-xs text-muted-foreground leading-none mt-0.5">
              Nutrition &amp; Wellness
            </p>
          </div>
        </div>
      </header>

      {/* ── Tab content (scrollable) ──────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto" id="macro-main">
        {activeTab === "home" && (
          <HomeTab
            store={store}
            selectedDate={selectedDate}
            setSelectedDate={(d) => {
              setSelectedDate(d);
            }}
            weekOffset={weekOffset}
            setWeekOffset={setWeekOffset}
          />
        )}
        {activeTab === "track" && (
          <TrackFoodTab store={store} selectedDate={selectedDate} />
        )}
        {activeTab === "trends" && <TrendsTab store={store} />}
      </main>

      {/* ── Bottom navigation ─────────────────────────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 border-t bg-card/90 backdrop-blur-md z-50"
        role="navigation"
        aria-label="Macro tracker navigation"
      >
        <div className="flex">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              id={`macro-tab-${id}`}
              onClick={() => setActiveTab(id)}
              className={`
                flex-1 flex flex-col items-center relative py-2.5 gap-0.5 transition-colors
                ${activeTab === id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
                }
              `}
              aria-label={label}
              aria-selected={activeTab === id}
            >
              {/* Active top indicator */}
              {activeTab === id && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-10 rounded-b-full bg-primary"
                  aria-hidden="true"
                />
              )}
              <Icon
                className={`h-5 w-5 transition-transform duration-200 ${
                  activeTab === id ? "scale-110" : ""
                }`}
              />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default MacroTracker;
