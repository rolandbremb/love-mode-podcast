"use client";

import { useState, type KeyboardEvent } from "react";

/* Two small charts, drawn as HTML so the marks follow the dataviz rules: bars at most
   24px wide, 4px rounded at the data end and square at the baseline, a 2px gap between
   stacked parts, hairline gridlines, a legend, and a tooltip on hover.
   Each chart is one keyboard stop: arrow keys move between bars, and the selected
   bar is read out. */

const CHART_HEIGHT = 200;
const SERIES_NEW = "#2a78d6";
const SERIES_LEFT = "#eb6834";

function niceMax(value: number) {
  if (value <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * power >= value / 4) ?? 10;
  return Math.ceil(value / (step * power)) * step * power;
}

// Shared hover and keyboard behaviour for a row of bars
function useActiveBar(count: number) {
  const [active, setActive] = useState<number | null>(null);
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const step = event.key === "ArrowRight" ? 1 : -1;
      setActive((current) => (current === null ? count - 1 : (current + step + count) % count));
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setActive(event.key === "Home" ? 0 : count - 1);
    } else if (event.key === "Escape") {
      setActive(null);
    }
  };
  return {
    active,
    setActive,
    container: {
      tabIndex: 0,
      onKeyDown,
      onFocus: () => setActive((current) => current ?? count - 1),
      onBlur: () => setActive(null),
    },
    dim: (index: number) => (active === null || active === index ? 1 : 0.45),
  };
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
      aria-hidden="true"
      className={`pointer-events-none absolute bottom-full z-10 mb-2 w-max min-w-[11rem] rounded-xl bg-plum px-3.5 py-2.5 text-sm text-shell shadow-[0_8px_24px_-8px_rgba(45,21,48,0.45)] ${
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
  const { active, setActive, container, dim } = useActiveBar(months.length);
  const max = niceMax(Math.max(...months.map((m) => m.total), 0));
  const money = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
  const rowsFor = (month: RevenueChartMonth) =>
    streams.filter((s) => month.byStream[s.value] > 0).map((s) => ({ label: s.label, value: money(month.byStream[s.value]), color: s.color }));
  const spoken =
    active === null
      ? ""
      : `${months[active].label}: ${money(months[active].total)}. ${rowsFor(months[active])
          .map((r) => `${r.label} ${r.value}`)
          .join(", ")}`;

  return (
    <div className="flex flex-col gap-4">
      <Legend items={streams.map((s) => ({ label: s.label, color: s.color }))} />
      <div
        {...container}
        role="group"
        aria-label="Revenue by month for the last twelve months. Use the left and right arrow keys to read each month."
        className="relative rounded-sm outline-offset-4"
        style={{ height: CHART_HEIGHT + 24 }}
      >
        {[max, max / 2, 0].map((tick) => (
          <div key={tick} className="absolute inset-x-0 flex items-center gap-2" style={{ top: CHART_HEIGHT - (tick / max) * CHART_HEIGHT - 8 }} aria-hidden="true">
            <span className="w-12 text-right text-xs tabular-nums text-plum/60">{money(tick)}</span>
            <span className="h-px flex-1 bg-plum/10" />
          </div>
        ))}
        <div className="absolute bottom-0 left-14 right-0 top-0 flex items-end justify-between gap-1" aria-hidden="true">
          {months.map((month, index) => {
            const parts = streams.filter((s) => month.byStream[s.value] > 0);
            return (
              <div
                key={month.month}
                className="relative flex h-full flex-1 flex-col items-center justify-end"
                onMouseEnter={() => setActive(index)}
                onMouseLeave={() => setActive(null)}
              >
                <span className="flex w-full max-w-[24px] flex-col-reverse" style={{ height: CHART_HEIGHT }}>
                  <span className="flex flex-col-reverse justify-start gap-[2px]" style={{ height: (month.total / max) * CHART_HEIGHT }}>
                    {parts.map((stream, i) => (
                      <span
                        key={stream.value}
                        className={`transition-opacity duration-150 ${i === parts.length - 1 ? "rounded-t-[4px]" : ""}`}
                        style={{ background: stream.color, flexGrow: month.byStream[stream.value], flexBasis: 0, minHeight: 2, opacity: dim(index) }}
                      />
                    ))}
                  </span>
                </span>
                <span className="mt-2 h-4 text-xs text-plum/60">{month.label}</span>
                {active === index && (
                  <Tooltip align={index > months.length / 2 ? "right" : "left"} title={`${month.label}: ${money(month.total)}`} rows={rowsFor(month)} />
                )}
              </div>
            );
          })}
        </div>
        <p className="sr-only" aria-live="polite">
          {spoken}
        </p>
      </div>
    </div>
  );
}

// ---------- Newsletter: new subscribers up, unsubscribes down ----------

export function GrowthChart({ weeks }: { weeks: { start: string; added: number; left: number }[] }) {
  const { active, setActive, container, dim } = useActiveBar(weeks.length);
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
  const spoken = active === null ? "" : `Week of ${weekLabel(weeks[active].start)}: ${weeks[active].added} new, ${weeks[active].left} unsubscribed`;

  return (
    <div className="flex flex-col gap-4">
      <Legend
        items={[
          { label: "New subscribers", color: SERIES_NEW },
          { label: "Unsubscribed", color: SERIES_LEFT },
        ]}
      />
      <div
        {...container}
        role="group"
        aria-label="New subscribers and unsubscribes per week for the last twelve weeks. Use the left and right arrow keys to read each week."
        className="relative rounded-sm outline-offset-4"
        style={{ height: CHART_HEIGHT + 24 }}
      >
        {ticks.map((tick) => (
          <div key={tick.label} className="absolute inset-x-0 flex items-center gap-2" style={{ top: tick.top - 8 }} aria-hidden="true">
            <span className="w-10 text-right text-xs tabular-nums text-plum/60">{tick.label}</span>
            <span className={`h-px flex-1 ${tick.baseline ? "bg-plum/30" : "bg-plum/10"}`} />
          </div>
        ))}
        <div className="absolute bottom-0 left-12 right-0 top-0 flex justify-between gap-1" aria-hidden="true">
          {weeks.map((week, index) => (
            <div
              key={week.start}
              className="relative flex flex-1 flex-col items-center"
              style={{ height: CHART_HEIGHT + 24 }}
              onMouseEnter={() => setActive(index)}
              onMouseLeave={() => setActive(null)}
            >
              <span className="flex w-full max-w-[24px] flex-col justify-end" style={{ height: up }}>
                <span className="rounded-t-[4px] transition-opacity duration-150" style={{ height: week.added * unit, background: SERIES_NEW, opacity: dim(index) }} />
              </span>
              <span className="flex w-full max-w-[24px] flex-col justify-start" style={{ height: down }}>
                <span className="rounded-b-[4px] transition-opacity duration-150" style={{ height: week.left * unit, background: SERIES_LEFT, opacity: dim(index) }} />
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
            </div>
          ))}
        </div>
        <p className="sr-only" aria-live="polite">
          {spoken}
        </p>
      </div>
      {/* The same numbers as a table, for screen readers */}
      <table className="sr-only">
        <caption>Newsletter growth per week</caption>
        <thead>
          <tr>
            <th>Week of</th>
            <th>New subscribers</th>
            <th>Unsubscribed</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week.start}>
              <td>{weekLabel(week.start)}</td>
              <td>{week.added}</td>
              <td>{week.left}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
