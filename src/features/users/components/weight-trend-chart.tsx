"use client";

import { useRef, useState } from "react";
import { formatDay } from "@/features/analytics/utils/format";

const WIDTH = 600;
const HEIGHT = 160;
const PAD = { top: 8, right: 8, bottom: 4, left: 8 };
const LINE = "#2a78d6";

function dayNumber(date: string) {
  return Date.parse(`${date}T00:00:00Z`) / 86_400_000;
}

/**
 * Body-weight line over time, x spaced by real dates (gaps in logging show
 * as longer segments). Pointer or arrow keys move a crosshair that snaps to
 * the nearest weigh-in.
 */
export function WeightTrendChart({
  points,
  units,
}: {
  points: { date: string; weight: number }[];
  units: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  if (points.length < 2) {
    return (
      <p className="py-8 text-center text-xs text-muted-foreground">
        {points.length === 0 ? "No weigh-ins in the last 180 days." : "Only one weigh-in in the last 180 days."}
      </p>
    );
  }

  const xs = points.map((p) => dayNumber(p.date));
  const ws = points.map((p) => p.weight);
  const minX = xs[0];
  const maxX = xs[xs.length - 1];
  const rawMin = Math.min(...ws);
  const rawMax = Math.max(...ws);
  const padY = Math.max((rawMax - rawMin) * 0.1, 0.5);
  const minY = rawMin - padY;
  const maxY = rawMax + padY;
  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const x = (d: number) => PAD.left + ((d - minX) / Math.max(1, maxX - minX)) * innerW;
  const y = (w: number) => PAD.top + (1 - (w - minY) / (maxY - minY)) * innerH;
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(xs[i]).toFixed(1)},${y(p.weight).toFixed(1)}`).join(" ");

  function nearestIndex(clientX: number) {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const sx = ((clientX - rect.left) / rect.width) * WIDTH;
    let best = 0;
    for (let i = 1; i < xs.length; i++) {
      if (Math.abs(x(xs[i]) - sx) < Math.abs(x(xs[best]) - sx)) best = i;
    }
    return best;
  }

  const a = active !== null ? points[active] : null;
  const latest = points[points.length - 1];

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between text-xs text-muted-foreground">
        <span>
          {a ? formatDay(a.date, true) : "Latest"}{" "}
          <span className="font-semibold tabular-nums text-foreground">
            {(a ?? latest).weight} {units}
          </span>
        </span>
        <span className="tabular-nums">
          range {rawMin}–{rawMax} {units}
        </span>
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-40 w-full touch-none overflow-visible outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        preserveAspectRatio="none"
        role="img"
        aria-label={`Body weight from ${formatDay(points[0].date, true)} to ${formatDay(latest.date, true)}, ${points[0].weight} to ${latest.weight} ${units}. Use arrow keys to step through weigh-ins.`}
        tabIndex={0}
        onPointerMove={(e) => setActive(nearestIndex(e.clientX))}
        onPointerLeave={() => setActive(null)}
        onBlur={() => setActive(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault();
            const step = e.key === "ArrowLeft" ? -1 : 1;
            setActive((i) => Math.min(points.length - 1, Math.max(0, (i ?? points.length - 1) + step)));
          }
        }}
      >
        <line x1={PAD.left} x2={WIDTH - PAD.right} y1={HEIGHT - PAD.bottom} y2={HEIGHT - PAD.bottom} stroke="var(--border)" vectorEffect="non-scaling-stroke" />
        <path d={path} fill="none" stroke={LINE} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {active !== null && (
          <line
            x1={x(xs[active])}
            x2={x(xs[active])}
            y1={PAD.top}
            y2={HEIGHT - PAD.bottom}
            stroke="var(--muted-foreground)"
            strokeDasharray="3 3"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
      <div className="flex justify-between text-[10px] tabular-nums text-muted-foreground" aria-hidden>
        <span>{formatDay(points[0].date, true)}</span>
        <span>{formatDay(latest.date, true)}</span>
      </div>
    </div>
  );
}
