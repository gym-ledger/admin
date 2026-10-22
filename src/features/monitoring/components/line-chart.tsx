"use client";

import { useRef, useState } from "react";

const WIDTH = 600;
const PAD = { top: 8, right: 4, bottom: 4, left: 4 };

export interface LineSeries {
  name: string;
  /** Any CSS color. */
  color: string;
  /** One value per x, same order as `xs`; null leaves a gap. */
  values: (number | null)[];
}

/**
 * Multi-series line chart on a shared time axis (a single y-scale, from 0).
 * Pointer or arrow keys move a crosshair that snaps to the nearest x; the
 * tooltip lists every series there. The legend doubles as the direct label:
 * it shows each series' latest value.
 */
export function LineChart({
  xs,
  series,
  formatValue,
  formatX,
  ariaLabel,
  height = 180,
}: {
  /** ms since the epoch, ascending. */
  xs: number[];
  series: LineSeries[];
  formatValue: (v: number | null) => string;
  formatX: (t: number) => string;
  ariaLabel: string;
  height?: number;
}) {
  const [active, setActive] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const all = series.flatMap((s) => s.values).filter((v): v is number => v !== null);
  if (all.length === 0) {
    return <p className="py-10 text-center text-xs text-muted-foreground">No requests in this window yet.</p>;
  }
  if (xs.length < 2) {
    return (
      <p className="py-10 text-center text-xs text-muted-foreground">
        Not enough history for a chart yet. Pick a shorter window, or check back later.
      </p>
    );
  }

  const max = Math.max(...all) * 1.1 || 1;
  const minX = xs[0];
  const maxX = xs[xs.length - 1];
  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = height - PAD.top - PAD.bottom;
  const x = (t: number) => PAD.left + ((t - minX) / Math.max(1, maxX - minX)) * innerW;
  const y = (v: number) => PAD.top + (1 - v / max) * innerH;

  // Break the path at nulls instead of drawing across missing data.
  const pathFor = (values: (number | null)[]) => {
    let d = "";
    let pen = false;
    values.forEach((v, i) => {
      if (v === null) {
        pen = false;
        return;
      }
      d += `${pen ? "L" : "M"}${x(xs[i]).toFixed(1)},${y(v).toFixed(1)} `;
      pen = true;
    });
    return d;
  };

  const latest = (values: (number | null)[]) => {
    for (let i = values.length - 1; i >= 0; i--) if (values[i] !== null) return values[i];
    return null;
  };

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

  const leftPct = active !== null ? (x(xs[active]) / WIDTH) * 100 : 0;

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {series.map((s) => (
          <li key={s.name} className="flex items-center gap-1.5">
            <span className="h-0.5 w-3 rounded-full" style={{ background: s.color }} />
            {s.name}
            <span className="font-medium tabular-nums text-foreground">{formatValue(latest(s.values))}</span>
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <div
          className="flex w-12 shrink-0 flex-col justify-between text-right text-[10px] tabular-nums text-muted-foreground"
          style={{ height }}
          aria-hidden
        >
          <span className="-translate-y-1/2">{formatValue(Math.round(max))}</span>
          <span className="translate-y-1/2">0</span>
        </div>

        <div className="relative min-w-0 flex-1">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${WIDTH} ${height}`}
            className="w-full touch-none overflow-visible outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            style={{ height }}
            preserveAspectRatio="none"
            role="img"
            aria-label={`${ariaLabel}, ${formatX(minX)} to ${formatX(maxX)}. Use arrow keys to step through points.`}
            tabIndex={0}
            onPointerMove={(e) => setActive(nearestIndex(e.clientX))}
            onPointerLeave={() => setActive(null)}
            onBlur={() => setActive(null)}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                e.preventDefault();
                const step = e.key === "ArrowLeft" ? -1 : 1;
                setActive((i) => Math.min(xs.length - 1, Math.max(0, (i ?? xs.length - 1) + step)));
              }
            }}
          >
            <line x1={PAD.left} x2={WIDTH - PAD.right} y1={PAD.top} y2={PAD.top} stroke="var(--border)" vectorEffect="non-scaling-stroke" />
            <line x1={PAD.left} x2={WIDTH - PAD.right} y1={height - PAD.bottom} y2={height - PAD.bottom} stroke="var(--border)" vectorEffect="non-scaling-stroke" />
            {series.map((s) => (
              <path
                key={s.name}
                d={pathFor(s.values)}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {active !== null && (
              <line
                x1={x(xs[active])}
                x2={x(xs[active])}
                y1={PAD.top}
                y2={height - PAD.bottom}
                stroke="var(--muted-foreground)"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>

          <div className="mt-1 flex justify-between text-[10px] tabular-nums text-muted-foreground" aria-hidden>
            <span>{formatX(minX)}</span>
            <span>{formatX(maxX)}</span>
          </div>

          {active !== null && (
            <div
              className="pointer-events-none absolute top-0 z-10 min-w-36 rounded-md border border-border bg-popover px-2.5 py-2 text-xs shadow-sm"
              style={{
                left: `${leftPct}%`,
                transform: `translate(${leftPct > 50 ? "calc(-100% - 8px)" : "8px"}, 0)`,
              }}
            >
              <div className="mb-1 text-muted-foreground">{formatX(xs[active])}</div>
              {series.every((s) => s.values[active] === null) && <div className="text-muted-foreground">No data</div>}
              {series.filter((s) => s.values[active] !== null).map((s) => (
                <div key={s.name} className="flex items-center gap-2">
                  <span className="h-0.5 w-3 rounded-full" style={{ background: s.color }} />
                  <span className="font-semibold tabular-nums text-foreground">{formatValue(s.values[active])}</span>
                  <span className="text-muted-foreground">{s.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
