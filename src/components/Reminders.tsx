import { useEffect, useState } from 'react';
import { dueReminders, toISODate, type UpcomingCharge } from '../lib/billing';
import { reminderText } from '../lib/reminders';
import type { Subscription } from '../types';

const NOTIFIED_KEY = 'subscription-radar:notified';

// One notification per charge date, so reopening the app doesn't repeat it.
function notifyOnce(due: UpcomingCharge[]) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  let sent: Record<string, string> = {};
  try {
    sent = JSON.parse(localStorage.getItem(NOTIFIED_KEY) ?? '{}');
  } catch {
    sent = {};
  }
  for (const c of due) {
    const stamp = toISODate(c.date);
    if (sent[c.sub.id] === stamp) continue;
    new Notification('Subscription Radar', { body: reminderText(c) });
    sent[c.sub.id] = stamp;
  }
  try {
    localStorage.setItem(NOTIFIED_KEY, JSON.stringify(sent));
  } catch {
    // ignore blocked storage
  }
}

export function Reminders({ subs, today }: { subs: Subscription[]; today: Date }) {
  const due = dueReminders(subs, today, 3);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission,
  );

  useEffect(() => {
    if (permission === 'granted') notifyOnce(due);
    // Re-check every hour while the tab stays open.
    const id = window.setInterval(() => permission === 'granted' && notifyOnce(dueReminders(subs, new Date(), 3)), 60 * 60 * 1000);
    return () => window.clearInterval(id);
  }, [subs, permission]); // eslint-disable-line react-hooks/exhaustive-deps

  const enable = async () => setPermission(await Notification.requestPermission());

  return (
    <section aria-label="Reminders" className="grid gap-2">
      {due.length === 0 ? (
        <p className="rounded-xl border border-[var(--grid)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--ink-2)]">
          <span aria-hidden>✓</span> Nothing charges in the next 3 days.
        </p>
      ) : (
        due.map((c) => (
          <div
            key={c.sub.id}
            role="alert"
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
              c.sub.isTrial
                ? 'border-[#d03b3b]/40 bg-[#d03b3b]/8 text-[var(--ink)]'
                : 'border-[#fab219]/60 bg-[#fab219]/12 text-[var(--ink)]'
            }`}
          >
            <span aria-hidden className="font-bold">{c.sub.isTrial ? '⚠' : '⏰'}</span>
            <span>
              <strong className="font-semibold">{c.sub.isTrial ? 'Trial ending: ' : 'Upcoming charge: '}</strong>
              {reminderText(c)}
            </span>
          </div>
        ))
      )}
      {permission === 'default' && (
        <button onClick={enable} className="justify-self-start rounded-lg border border-[var(--grid)] px-3 py-1.5 text-xs font-medium text-[var(--ink-2)] hover:bg-[var(--hover)]">
          Turn on browser reminders
        </button>
      )}
      {permission === 'denied' && <p className="text-xs text-[var(--muted)]">Browser notifications are blocked. You will still see reminders here.</p>}
    </section>
  );
}
