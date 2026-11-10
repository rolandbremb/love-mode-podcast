"use client";

import { useState } from "react";

/* Two small charts, drawn as HTML so the marks follow the dataviz rules: bars at most
   24px wide, 4px rounded at the data end and square at the baseline, a 2px gap between
   stacked parts, hairline gridlines, a legend, and a tooltip on hover or focus. */

const CHART_HEIGHT = 200;
const SERIES_NEW = "#2a78d6";
const SERIES_LEFT = "#eb6834";

function niceMax(value: number) {
  if (value <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * power >= value / 4) ?? 10;
  return Math.ceil(value / (step * power)) * step * power;
}

function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-plum/80">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: item.color }} aria-hidden="true" />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

function Tooltip({ title, rows, align }: { title: string; rows: { label: string; value: string; color?: string }[]; align: "left" | "right" }) {
  return (
    <div
      role="tooltip"
      className={`pointer-events-none absolute bottom-full z-10 mb-2 w-max min-w-[11rem] rounded-xl bg-plum px-3.5 py-2.5 text-sm text-shell shadow-postal ${
        align === "left" ? "left-0" : "right-0"
      }`}
    >
      <p className="mb-1.5 font-semibold">{title}</p>
      <ul className="flex flex-col gap-1">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2">
              {row.color && <span className="h-2 w-2 rounded-[2px]" style={{ background: row.color }} aria-hidden="true" />}
              {row.label}
            </span>
            <span className="tabular-nums">{row.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------- Revenue: stacked monthly bars ----------

export type RevenueChartMonth = { month: string; label: string; total: number; byStream: Record<string, number> };

export function RevenueChart({
  months,
  streams,
}: {
  months: RevenueChartMonth[];
  streams: readonly { value: string; label: string; color: string }[];
}) {
  const [active, setActive] = useState<number | null>(null);
  const max = niceMax(Math.max(...months.map((m) => m.total), 0));
  const money = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
  const ticks = [max, max / 2, 0];

  return (
    <div className="flex flex-col gap-4">
      <Legend items={streams.map((s) => ({ label: s.label, color: s.color }))} />
      <div className="relative" style={{ height: CHART_HEIGHT + 24 }}>
        {ticks.map((tick) => (
          <div
            key={tick}
            className="absolute inset-x-0 flex items-center gap-2"
            style={{ top: CHART_HEIGHT - (tick / max) * CHART_HEIGHT - 8 }}
            aria-hidden="true"
          >
            <span className="w-12 text-right text-xs tabular-nums text-plum/55">{money(tick)}</span>
            <span className="h-px flex-1 bg-plum/10" />
          </div>
        ))}
        <div className="absolute bottom-0 left-14 right-0 top-0 flex items-end justify-between gap-1">
          {months.map((month, index) => {
            const parts = streams.filter((s) => month.byStream[s.value] > 0);
            return (
              <button
                key={month.month}
                type="button"
                className="relative flex h-full flex-1 flex-col items-center justify-end outline-offset-2"
                onMouseEnter={() => setActive(index)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(index)}
                onBlur={() => setActive(null)}
                aria-label={`${month.label}: ${money(month.total)}`}
              >
                <span className="flex w-full max-w-[24px] flex-col-reverse" style={{ height: CHART_HEIGHT }}>
                  <span className="flex flex-col-reverse justify-start gap-[2px]" style={{ height: (month.total / max) * CHART_HEIGHT }}>
                    {parts.map((stream, i) => (
                      <span
                        key={stream.value}
                        className={i === parts.length - 1 ? "rounded-t-[4px]" : ""}
                        style={{
                          background: stream.color,
                          flexGrow: month.byStream[stream.value],
                          flexBasis: 0,
                          minHeight: 2,
                          opacity: active === null || active === index ? 1 : 0.45,
                        }}
                      />
                    ))}
                  </span>
                </span>
                <span className="mt-2 h-4 text-xs text-plum/60">{month.label}</span>
                {active === index && (
                  <Tooltip
                    align={index > months.length / 2 ? "right" : "left"}
                    title={`${month.label}: ${money(month.total)}`}
                    rows={streams
                      .filter((s) => month.byStream[s.value] > 0)
                      .map((s) => ({ label: s.label, value: money(month.byStream[s.value]), color: s.color }))}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------- Newsletter: new subscribers up, unsubscribes down ----------

export function GrowthChart({ weeks }: { weeks: { start: string; added: number; left: number }[] }) {
  const [active, setActive] = useState<number | null>(null);
  // One scale for both directions; each side only extends as far as its data needs
  const maxAdded = niceMax(Math.max(...weeks.map((w) => w.added), 0));
  const maxLeft = niceMax(Math.max(...weeks.map((w) => w.left), 0));
  const unit = CHART_HEIGHT / (maxAdded + maxLeft);
  const up = maxAdded * unit;
  const down = maxLeft * unit;
  const weekLabel = (start: string) =>
    new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(start));
  const ticks = [
    { label: String(maxAdded), top: 0, baseline: false },
    { label: "0", top: up, baseline: true },
    { label: `−${maxLeft}`, top: CHART_HEIGHT, baseline: false },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Legend
        items={[
          { label: "New subscribers", color: SERIES_NEW },
          { label: "Unsubscribed", color: SERIES_LEFT },
        ]}
      />
      <div className="relative" style={{ height: CHART_HEIGHT + 24 }}>
        {ticks.map((tick) => (
          <div key={tick.label} className="absolute inset-x-0 flex items-center gap-2" style={{ top: tick.top - 8 }} aria-hidden="true">
            <span className="w-10 text-right text-xs tabular-nums text-plum/55">{tick.label}</span>
            <span className={`h-px flex-1 ${tick.baseline ? "bg-plum/30" : "bg-plum/10"}`} />
          </div>
        ))}
        <div className="absolute bottom-0 left-12 right-0 top-0 flex justify-between gap-1">
          {weeks.map((week, index) => (
            <button
              key={week.start}
              type="button"
              className="relative flex flex-1 flex-col items-center outline-offset-2"
              style={{ height: CHART_HEIGHT + 24 }}
              onMouseEnter={() => setActive(index)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(index)}
              onBlur={() => setActive(null)}
              aria-label={`Week of ${weekLabel(week.start)}: ${week.added} new, ${week.left} unsubscribed`}
            >
              <span className="flex w-full max-w-[24px] flex-col justify-end" style={{ height: up }}>
                <span className="rounded-t-[4px]" style={{ height: week.added * unit, background: SERIES_NEW, opacity: active === null || active === index ? 1 : 0.45 }} />
              </span>
              <span className="flex w-full max-w-[24px] flex-col justify-start" style={{ height: down }}>
                <span className="rounded-b-[4px]" style={{ height: week.left * unit, background: SERIES_LEFT, opacity: active === null || active === index ? 1 : 0.45 }} />
              </span>
              {index % 2 === 1 && <span className="mt-2 text-xs text-plum/60">{weekLabel(week.start)}</span>}
              {active === index && (
                <Tooltip
                  align={index > weeks.length / 2 ? "right" : "left"}
                  title={`Week of ${weekLabel(week.start)}`}
                  rows={[
                    { label: "New", value: `+${week.added}`, color: SERIES_NEW },
                    { label: "Unsubscribed", value: `−${week.left}`, color: SERIES_LEFT },
                  ]}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
