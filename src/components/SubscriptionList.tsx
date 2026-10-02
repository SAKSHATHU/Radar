import { daysUntil, formatMoney, monthlyCost, nextChargeDate } from '../lib/billing';
import type { Subscription } from '../types';

interface Props {
  subs: Subscription[];
  today: Date;
  onEdit: (sub: Subscription) => void;
  onDelete: (id: string) => void;
}

const CYCLE_LABEL = { weekly: '/wk', monthly: '/mo', yearly: '/yr' } as const;

export function SubscriptionList({ subs, today, onEdit, onDelete }: Props) {
  if (subs.length === 0) {
    return <p className="text-sm text-[var(--ink-2)]">No subscriptions yet. Add your first one above.</p>;
  }

  const sorted = [...subs].sort((a, b) => nextChargeDate(a, today).getTime() - nextChargeDate(b, today).getTime());

  return (
    <ul className="divide-y divide-[var(--grid)]">
      {sorted.map((sub) => {
        const next = nextChargeDate(sub, today);
        const days = daysUntil(next, today);
        return (
          <li key={sub.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-semibold text-[var(--ink)]">{sub.name}</span>
                {sub.isTrial && <span className="rounded-full bg-[#d03b3b]/10 px-2 py-0.5 text-[11px] font-semibold text-[#b02e2e] dark:text-[#ef8a8a]">Trial</span>}
              </div>
              <div className="text-xs text-[var(--muted)]">
                {sub.category} · next {next.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ({days === 0 ? 'today' : `${days}d`})
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold tabular-nums text-[var(--ink)]">
                {formatMoney(sub.cost)}
                <span className="text-xs font-normal text-[var(--muted)]">{CYCLE_LABEL[sub.cycle]}</span>
              </div>
              {sub.cycle !== 'monthly' && <div className="text-xs tabular-nums text-[var(--muted)]">≈ {formatMoney(monthlyCost(sub))}/mo</div>}
            </div>
            <div className="flex gap-1">
              <button onClick={() => onEdit(sub)} className="rounded-md px-2 py-1 text-xs text-[var(--ink-2)] hover:bg-[var(--hover)]" aria-label={`Edit ${sub.name}`}>
                Edit
              </button>
              <button onClick={() => onDelete(sub.id)} className="rounded-md px-2 py-1 text-xs text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950" aria-label={`Delete ${sub.name}`}>
                Delete
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
