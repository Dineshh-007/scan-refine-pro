import { useMemo, useState } from "react";
import { subDays, format, addDays, eachMonthOfInterval, subMonths } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card } from "@/components/ui/card";
import { MacroStore, DayLog } from "@/hooks/useMacroStore";

// ─── Types ────────────────────────────────────────────────────────────────────

type Filter = "7d" | "30d" | "365d";

interface DataPoint {
  label: string;
  weight:  number | null;
  sleep:   number | null;
  steps:   number | null;
  workout: number | null;
  water:   number | null;
}

type MetricKey = keyof Omit<DataPoint, "label">;

interface Metric {
  key:   MetricKey;
  label: string;
  color: string;
  unit:  string;
}

// ─── Aggregation helpers ──────────────────────────────────────────────────────

function getDailyData(
  days: Record<string, DayLog>,
  n: number,
  labelFmt: string
): DataPoint[] {
  return Array.from({ length: n }, (_, i) => {
    const date = subDays(new Date(), n - 1 - i);
    const key  = format(date, "yyyy-MM-dd");
    const day  = days[key];
    return {
      label:   format(date, labelFmt),
      weight:  day?.weight  ? Number(day.weight)  : null,
      sleep:   day?.sleep   ? Number(day.sleep)   : null,
      steps:   day?.steps   ? Number(day.steps)   : null,
      workout: day?.workout ? Number(day.workout) : null,
      water:   day?.water   ? Number(day.water)   : null,
    };
  });
}

function getMonthlyData(days: Record<string, DayLog>): DataPoint[] {
  const months = eachMonthOfInterval({
    start: subMonths(new Date(), 11),
    end:   new Date(),
  });

  return months.map((monthStart) => {
    const monthDays: DayLog[] = [];
    for (let di = 0; di < 31; di++) {
      const d = addDays(monthStart, di);
      if (d.getMonth() !== monthStart.getMonth()) break;
      const key = format(d, "yyyy-MM-dd");
      if (days[key]) monthDays.push(days[key]);
    }

    const avg = (f: "weight" | "sleep" | "steps" | "workout" | "water") => {
      const vals = monthDays
        .map((d) => (d[f] ? Number(d[f]) : null))
        .filter((v): v is number => v !== null && v > 0);
      return vals.length
        ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
        : null;
    };

    return {
      label:   format(monthStart, "MMM"),
      weight:  avg("weight"),
      sleep:   avg("sleep"),
      steps:   avg("steps"),
      workout: avg("workout"),
      water:   avg("water"),
    };
  });
}

// ─── Statistics ───────────────────────────────────────────────────────────────

function calcAverage(data: DataPoint[], field: MetricKey): number {
  const vals = data
    .map((d) => d[field])
    .filter((v): v is number => v !== null && v > 0);
  return vals.length
    ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
    : 0;
}

function calcTotal(data: DataPoint[], field: MetricKey): number {
  return Math.round(
    data
      .map((d) => d[field])
      .filter((v): v is number => v !== null)
      .reduce((a, b) => a + b, 0) * 10
  ) / 10;
}

// ─── Metric chart ─────────────────────────────────────────────────────────────

interface MetricChartProps {
  data: DataPoint[];
  metric: Metric;
}

function MetricChart({ data, metric }: MetricChartProps) {
  const avg = calcAverage(data, metric.key);
  const tot = calcTotal(data, metric.key);

  // Replace nulls with 0 so recharts renders bars (zero-height bars look fine)
  const chartData = data.map((d) => ({
    ...d,
    [metric.key]: d[metric.key] ?? 0,
  }));

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-1">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ background: metric.color, boxShadow: `0 0 6px ${metric.color}` }}
          />
          {metric.label}
        </h4>
      </div>
      <div className="flex gap-4 text-xs text-muted-foreground mb-3">
        <span>
          Total:{" "}
          <strong className="text-foreground">
            {tot.toLocaleString()} {metric.unit}
          </strong>
        </span>
        <span>
          Avg:{" "}
          <strong className="text-foreground">
            {avg.toLocaleString()} {metric.unit}
          </strong>
        </span>
      </div>

      <ResponsiveContainer width="100%" height={140}>
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 4, left: -24, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            opacity={0.4}
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "10px",
              fontSize: "12px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
            formatter={(v: number) => [
              `${v} ${metric.unit}`,
              metric.label,
            ]}
            cursor={{ fill: "hsl(var(--accent))", opacity: 0.5 }}
          />
          <Bar
            dataKey={metric.key}
            fill={metric.color}
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
            style={{ filter: `drop-shadow(0 2px 4px ${metric.color}55)` }}
          />
          {avg > 0 && (
            <ReferenceLine
              y={avg}
              stroke={metric.color}
              strokeDasharray="5 4"
              strokeOpacity={0.85}
              label={{
                value: `avg: ${avg}`,
                position: "insideTopRight",
                fontSize: 9,
                fill: metric.color,
                dy: -2,
              }}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ─── TrendsTab (main export) ──────────────────────────────────────────────────

const METRICS: Metric[] = [
  { key: "weight",  label: "Weight",  color: "#f59e0b", unit: "kg"    },
  { key: "sleep",   label: "Sleep",   color: "#818cf8", unit: "hrs"   },
  { key: "steps",   label: "Steps",   color: "#38bdf8", unit: "steps" },
  { key: "workout", label: "Workout", color: "#a78bfa", unit: "min"   },
  { key: "water",   label: "Water",   color: "#34d399", unit: "L"     },
];

const FILTERS: { id: Filter; label: string }[] = [
  { id: "7d",   label: "Last 7 Days" },
  { id: "30d",  label: "Last 30 Days" },
  { id: "365d", label: "Last Year"   },
];

interface TrendsTabProps {
  store: MacroStore;
}

export default function TrendsTab({ store }: TrendsTabProps) {
  const [filter, setFilter] = useState<Filter>("7d");
  const { days } = store;

  const data = useMemo((): DataPoint[] => {
    if (filter === "7d")   return getDailyData(days, 7,  "EEE");
    if (filter === "30d")  return getDailyData(days, 30, "M/d");
    return getMonthlyData(days);
  }, [filter, days]);

  return (
    <div className="px-4 py-4 space-y-4 pb-28">
      {/* Filter pills */}
      <div className="flex gap-2">
        {FILTERS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
              filter === id
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Metric charts */}
      {METRICS.map((metric) => (
        <MetricChart key={metric.key} data={data} metric={metric} />
      ))}
    </div>
  );
}
