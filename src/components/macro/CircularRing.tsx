interface CircularRingProps {
  label: string;
  unit: string;
  consumed: number;
  target: number;
  color: string;
  size?: number;
}

/**
 * Reusable SVG circular progress ring used for macro tracking.
 */
export default function CircularRing({
  label,
  unit,
  consumed,
  target,
  color,
  size = 88,
}: CircularRingProps) {
  const strokeWidth = 7;
  const r = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(consumed / (target || 1), 1);
  const offset = circumference * (1 - pct);
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="overflow-visible">
          {/* Track */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-border/30"
          />
          {/* Progress arc */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{
              transition: "stroke-dashoffset 0.7s ease",
              filter: `drop-shadow(0 0 5px ${color}99)`,
            }}
          />
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-sm font-bold tabular-nums leading-none">
            {Math.round(consumed)}
          </span>
          <span className="text-[9px] text-muted-foreground leading-none mt-0.5">
            {unit}
          </span>
        </div>
      </div>
      <p className="text-[11px] font-semibold text-center">{label}</p>
      <p className="text-[9px] text-muted-foreground text-center -mt-0.5">
        / {target}
      </p>
    </div>
  );
}
