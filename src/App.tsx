import { lazy, Suspense, useState } from 'react';
import { Reminders } from './components/Reminders';
import { RenewalCalendar } from './components/RenewalCalendar';
import { SubscriptionForm } from './components/SubscriptionForm';
import { SubscriptionList } from './components/SubscriptionList';
import { formatMoney, totalDueWithin, totalMonthly } from './lib/billing';
import { useAppDispatch, useAppSelector } from './store/store';
import { addSubscription, removeSubscription, updateSubscription } from './store/subscriptionsSlice';
import type { Subscription } from './types';

// Lazy-load the chart so Recharts stays out of the initial bundle.
const CostChart = lazy(() => import('./components/CostChart').then((m) => ({ default: m.CostChart })));

function Card({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-[var(--grid)] bg-[var(--surface)] p-4 sm:p-5 ${className}`}>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">{title}</h2>
      {children}
    </section>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-[var(--grid)] bg-[var(--surface)] p-4">
      <div className="text-xs font-medium text-[var(--muted)]">{label}</div>
      <div className="mt-1 text-2xl font-bold tabular-nums text-[var(--ink)]">{value}</div>
      {hint && <div className="text-xs text-[var(--ink-2)]">{hint}</div>}
    </div>
  );
}

export default function App() {
  const subs = useAppSelector((s) => s.subscriptions.items);
  const dispatch = useAppDispatch();
  const [editing, setEditing] = useState<Subscription | null>(null);
  const today = new Date();

  const monthly = totalMonthly(subs);
  const trials = subs.filter((s) => s.isTrial).length;

  return (
    <div className="min-h-screen bg-[var(--page)] text-[var(--ink)]">
      <main className="mx-auto grid max-w-6xl gap-4 px-4 py-6 sm:py-10">
        <header>
          <h1 className="text-2xl font-bold sm:text-3xl">Subscription Radar</h1>
          <p className="text-sm text-[var(--ink-2)]">Track every subscription and free trial, and get a heads-up 3 days before you are charged.</p>
        </header>

        <Reminders subs={subs} today={today} />

        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Per month" value={formatMoney(monthly)} hint={`${subs.length} subscription${subs.length === 1 ? '' : 's'}`} />
          <Stat label="Per year" value={formatMoney(monthly * 12)} />
          <Stat label="Next 30 days" value={formatMoney(totalDueWithin(subs, today, 30))} hint={trials ? `${trials} free trial${trials === 1 ? '' : 's'} active` : undefined} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card title={editing ? `Edit ${editing.name}` : 'Add a subscription'}>
            {editing ? (
              <SubscriptionForm
                key={editing.id}
                initial={editing}
                onSubmit={(sub) => {
                  dispatch(updateSubscription({ ...sub, id: editing.id }));
                  setEditing(null);
                }}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <SubscriptionForm onSubmit={(sub) => dispatch(addSubscription(sub))} />
            )}
          </Card>

          <Card title="Monthly cost by category">
            <Suspense fallback={<p className="text-sm text-[var(--muted)]">Loading chart…</p>}>
              <CostChart subs={subs} />
            </Suspense>
          </Card>

          <Card title="Your subscriptions">
            <SubscriptionList subs={subs} today={today} onEdit={setEditing} onDelete={(id) => dispatch(removeSubscription(id))} />
          </Card>

          <Card title="Renewal calendar">
            <RenewalCalendar subs={subs} today={today} />
          </Card>
        </div>
      </main>
    </div>
  );
}
