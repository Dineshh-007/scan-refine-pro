import { format, startOfWeek, addDays, isSameDay, isToday } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MacroStore, getMacroTotals } from "@/hooks/useMacroStore";
import CircularRing from "./CircularRing";

interface HomeTabProps {
  store: MacroStore;
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  weekOffset: number;
  setWeekOffset: (n: number) => void;
}

const RING_COLORS = {
  calories: "#38bdf8",
  protein: "#818cf8",
  carbs: "#f59e0b",
  fat: "#f472b6",
};

const INPUT_FIELDS: {
  field: "weight" | "sleep" | "steps" | "workout" | "water";
  label: string;
  unit: string;
  emoji: string;
  step: string;
  placeholder: string;
}[] = [
  { field: "weight",  label: "Weight",  unit: "kg",    emoji: "⚖️",  step: "0.1", placeholder: "0.0" },
  { field: "sleep",   label: "Sleep",   unit: "hrs",   emoji: "😴",  step: "0.5", placeholder: "0.0" },
  { field: "steps",   label: "Steps",   unit: "steps", emoji: "👟",  step: "100", placeholder: "0"   },
  { field: "workout", label: "Workout", unit: "min",   emoji: "💪",  step: "5",   placeholder: "0"   },
  { field: "water",   label: "Water",   unit: "L",     emoji: "💧",  step: "0.1", placeholder: "0.0" },
];

export default function HomeTab({
  store,
  selectedDate,
  setSelectedDate,
  weekOffset,
  setWeekOffset,
}: HomeTabProps) {
  const { getDay, patchDay, targets } = store;

  // Build the 7-day week (Mon–Sun) for the current view
  const weekStart = addDays(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
    weekOffset * 7
  );
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const dayKey = format(selectedDate, "yyyy-MM-dd");
  const dayLog = getDay(dayKey);
  const totals = getMacroTotals(dayLog);

  const handleField =
    (field: "weight" | "sleep" | "steps" | "workout" | "water") =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      patchDay(dayKey, { [field]: e.target.value });

  const steps   = Number(dayLog.steps)   || 0;
  const workout = Number(dayLog.workout) || 0;

  return (
    <div className="px-4 py-4 space-y-5 pb-28">
      {/* ── Day Selector ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setWeekOffset(weekOffset - 1)}
          className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          aria-label="Previous week"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex-1 flex justify-between gap-0.5">
          {weekDays.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            const todayDay   = isToday(day);
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`
                  flex-1 flex flex-col items-center py-2 rounded-xl transition-all duration-200
                  ${isSelected
                    ? "bg-primary text-primary-foreground shadow-md scale-105"
                    : todayDay
                    ? "bg-primary/15 text-primary"
                    : "hover:bg-accent text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                <span className="text-[9px] font-semibold uppercase tracking-wide">
                  {format(day, "EEE")}
                </span>
                <span className="text-sm font-bold leading-tight">
                  {format(day, "d")}
                </span>
                <span className="text-[8px] opacity-60 leading-tight">
                  {format(day, "MM/dd")}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setWeekOffset(weekOffset + 1)}
          className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          aria-label="Next week"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <p className="text-center text-xs text-muted-foreground -mt-2">
        {format(selectedDate, "EEEE, MMMM d, yyyy")}
      </p>

      {/* ── Macro Rings ──────────────────────────────────────────────────── */}
      <Card className="p-4">
        <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">
          Daily Macros
        </h3>
        <div className="grid grid-cols-4 gap-2">
          <CircularRing
            label="Calories" unit="kcal"
            consumed={totals.calories} target={targets.calories}
            color={RING_COLORS.calories}
          />
          <CircularRing
            label="Protein" unit="g"
            consumed={totals.protein} target={targets.protein}
            color={RING_COLORS.protein}
          />
          <CircularRing
            label="Carbs" unit="g"
            consumed={totals.carbs} target={targets.carbs}
            color={RING_COLORS.carbs}
          />
          <CircularRing
            label="Fat" unit="g"
            consumed={totals.fat} target={targets.fat}
            color={RING_COLORS.fat}
          />
        </div>

        {/* Macro summary bar */}
        <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden flex gap-px">
          {[
            { val: totals.calories, target: targets.calories, color: RING_COLORS.calories },
            { val: totals.protein,  target: targets.protein,  color: RING_COLORS.protein  },
            { val: totals.carbs,    target: targets.carbs,    color: RING_COLORS.carbs    },
            { val: totals.fat,      target: targets.fat,      color: RING_COLORS.fat      },
          ].map(({ val, target, color }, i) => (
            <div
              key={i}
              className="h-full transition-all duration-700"
              style={{
                width: `${Math.min((val / (target || 1)) * 25, 25)}%`,
                background: color,
                opacity: 0.85,
              }}
            />
          ))}
        </div>
      </Card>

      {/* ── Daily Tracking Inputs ─────────────────────────────────────────── */}
      <Card className="p-4">
        <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">
          Daily Tracking
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          {INPUT_FIELDS.map(({ field, label, unit, emoji, step, placeholder }) => (
            <div
              key={field}
              className="flex items-center gap-2.5 bg-muted/40 hover:bg-muted/60 transition-colors rounded-xl px-3 py-3"
            >
              <span className="text-xl flex-shrink-0">{emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wide leading-none mb-1">
                  {label}
                </p>
                <input
                  type="number"
                  step={step}
                  value={dayLog[field]}
                  onChange={handleField(field)}
                  placeholder={placeholder}
                  className="w-full bg-transparent text-sm font-bold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <span className="text-[9px] text-muted-foreground whitespace-nowrap flex-shrink-0">
                {unit}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Activity Progress ─────────────────────────────────────────────── */}
      <Card className="p-4 space-y-5">
        <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
          Activity Progress
        </h3>

        {/* Steps */}
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-sm font-medium">👟 Steps</span>
            <span className="text-sm font-bold tabular-nums">
              {steps.toLocaleString()}
              <span className="text-muted-foreground font-normal text-xs">
                {" "}/ {targets.stepsTarget.toLocaleString()}
              </span>
            </span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min((steps / targets.stepsTarget) * 100, 100)}%`,
                background: "linear-gradient(90deg,#38bdf8,#818cf8)",
                boxShadow: "0 0 8px rgba(56,189,248,0.45)",
              }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 text-right">
            {Math.round(Math.min((steps / targets.stepsTarget) * 100, 100))}% of daily goal
          </p>
        </div>

        {/* Workout */}
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-sm font-medium">💪 Workout</span>
            <span className="text-sm font-bold tabular-nums">
              {workout} min
              <span className="text-muted-foreground font-normal text-xs">
                {" "}/ {targets.workoutTarget} min
              </span>
            </span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min((workout / targets.workoutTarget) * 100, 100)}%`,
                background: "linear-gradient(90deg,#818cf8,#f472b6)",
                boxShadow: "0 0 8px rgba(129,140,248,0.45)",
              }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 text-right">
            {Math.round(Math.min((workout / targets.workoutTarget) * 100, 100))}% of weekly goal
          </p>
        </div>
      </Card>
    </div>
  );
}
