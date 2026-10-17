"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/features/analytics/utils/format";

export interface BarSeries {
  name: string;
  /** Any CSS color. Bars stack bottom-up in series order. */
  color: string;
}

export interface BarDatum {
  /** Short x-axis label, e.g. "Oct 17". */
  label: string;
  /** One value per series, same order as `series`. */
  values: number[];
}

/**
 * Small dependency-free stacked column chart. Each column is focusable and
 * shows a tooltip with every series on hover/focus; values are also
 * available in the table view each dashboard renders below its charts.
 */
export function StackedBarChart({
  series,
  data,
  height = 160,
  ariaLabel,
}: {
  series: BarSeries[];
  data: BarDatum[];
  height?: number;
  ariaLabel: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const totals = data.map((d) => d.values.reduce((a, b) => a + b, 0));
  const max = Math.max(1, ...totals);
  const tickIdx = new Set([0, Math.floor((data.length - 1) / 2), data.length - 1]);

  return (
    <div className="flex flex-col gap-2">
      {series.length > 1 && (
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {series.map((s) => (
            <li key={s.name} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-[2px]" style={{ background: s.color }} />
              {s.name}
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        {/* Y axis: max and zero only, recessive. */}
        <div
          className="flex w-8 shrink-0 flex-col justify-between text-right text-[10px] tabular-nums text-muted-foreground"
          style={{ height }}
          aria-hidden
        >
          <span className="-translate-y-1/2">{formatNumber(max)}</span>
          <span className="translate-y-1/2">0</span>
        </div>

        <div className="relative min-w-0 flex-1">
          <div
            role="list"
            aria-label={ariaLabel}
            className="relative flex items-end gap-[2px] border-b border-border"
            style={{ height }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-border" aria-hidden />
            {data.map((d, i) => {
              const total = totals[i];
              const summary = `${d.label}: ${series
                .map((s, si) => `${s.name} ${formatNumber(d.values[si])}`)
                .join(", ")}`;
              return (
                <div
                  key={`${d.label}-${i}`}
                  role="listitem"
                  tabIndex={0}
                  aria-label={summary}
                  className="group relative flex h-full min-w-0 flex-1 flex-col justify-end outline-none"
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                >
                  <div
                    className={cn(
                      "flex flex-col-reverse gap-[2px] transition-opacity",
                      active !== null && active !== i && "opacity-60",
                    )}
                    style={{ height: `${(total / max) * 100}%` }}
                  >
                    {series.map((s, si) => {
                      const v = d.values[si];
                      if (!v) return null;
                      return (
                        <div
                          key={s.name}
                          className="w-full last:rounded-t-[4px]"
                          style={{ background: s.color, flexGrow: v, minHeight: 2 }}
                        />
                      );
                    })}
                  </div>
                  <div className="absolute inset-0 rounded-sm group-focus-visible:ring-2 group-focus-visible:ring-ring/50" />
                </div>
              );
            })}
          </div>

          {/* X labels: first, middle and last only, so they never collide. */}
          <div className="relative mt-1 h-4 text-[10px] tabular-nums text-muted-foreground" aria-hidden>
            {data.map((d, i) =>
              tickIdx.has(i) ? (
                <span
                  key={i}
                  className="absolute whitespace-nowrap"
                  style={{
                    left: `${((i + 0.5) / data.length) * 100}%`,
                    transform:
                      i === 0 ? "translateX(-25%)" : i === data.length - 1 ? "translateX(-75%)" : "translateX(-50%)",
                  }}
                >
                  {d.label}
                </span>
              ) : null,
            )}
          </div>

          {active !== null && data[active] && (
            <div
              className="pointer-events-none absolute top-0 z-10 min-w-36 rounded-md border border-border bg-popover px-2.5 py-2 text-xs shadow-sm"
              style={{
                left: `${((active + 0.5) / data.length) * 100}%`,
                transform: `translate(${active > data.length / 2 ? "-100%" : "0"}, calc(-100% - 4px))`,
              }}
            >
              <div className="mb-1 text-muted-foreground">{data[active].label}</div>
              {series.map((s, si) => (
                <div key={s.name} className="flex items-center gap-2">
                  <span className="h-0.5 w-3 rounded-full" style={{ background: s.color }} />
                  <span className="font-semibold tabular-nums text-foreground">
                    {formatNumber(data[active].values[si])}
                  </span>
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
