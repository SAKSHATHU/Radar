import { useState } from 'react';
import { chargesInMonth, formatMoney } from '../lib/billing';
import type { Subscription } from '../types';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function RenewalCalendar({ subs, today }: { subs: Subscription[]; today: Date }) {
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const byDay = chargesInMonth(subs, view.year, view.month);
  const firstWeekday = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const label = new Date(view.year, view.month, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const isThisMonth = view.year === today.getFullYear() && view.month === today.getMonth();
  const monthTotal = [...byDay.values()].flat().reduce((s, sub) => s + sub.cost, 0);

  const shift = (delta: number) =>
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const cells: (number | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <button onClick={() => shift(-1)} className="rounded-lg px-2 py-1 text-sm text-[var(--ink-2)] hover:bg-[var(--hover)]" aria-label="Previous month">
          ‹ Prev
        </button>
        <div className="text-center">
          <div className="font-semibold text-[var(--ink)]">{label}</div>
          <div className="text-xs text-[var(--muted)]">{formatMoney(monthTotal)} in charges</div>
        </div>
        <button onClick={() => shift(1)} className="rounded-lg px-2 py-1 text-sm text-[var(--ink-2)] hover:bg-[var(--hover)]" aria-label="Next month">
          Next ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs" role="grid" aria-label={`Renewals in ${label}`}>
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1 font-medium text-[var(--muted)]">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`blank-${i}`} />;
          const charges = byDay.get(day) ?? [];
          const isToday = isThisMonth && day === today.getDate();
          return (
            <div
              key={day}
              title={charges.map((c) => `${c.name}: ${formatMoney(c.cost)}`).join('\n') || undefined}
              className={`min-h-14 rounded-lg border p-1 text-left ${isToday ? 'border-blue-600' : 'border-[var(--grid)]'} ${charges.length ? 'bg-[var(--series-1-soft)]' : ''}`}
            >
              <div className={`text-[11px] ${isToday ? 'font-bold text-blue-700 dark:text-blue-300' : 'text-[var(--muted)]'}`}>{day}</div>
              {charges.slice(0, 2).map((c) => (
                <div key={c.id} className="truncate text-[11px] font-medium text-[var(--ink)]">
                  {c.isTrial ? '⚠ ' : ''}
                  {c.name}
                </div>
              ))}
              {charges.length > 2 && <div className="text-[10px] text-[var(--muted)]">+{charges.length - 2} more</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
