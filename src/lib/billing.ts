import type { BillingCycle, Category, Subscription } from '../types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Parse as a local date; new Date('YYYY-MM-DD') is UTC and can land on the previous day.
export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Jan 31 + 1 month = Feb 28 (or 29), not Mar 3.
export function addMonthsClamped(date: Date, months: number): Date {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(date.getDate(), lastDay));
  return target;
}

function chargeAt(anchor: Date, cycle: BillingCycle, n: number): Date {
  if (cycle === 'weekly') return new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + 7 * n);
  if (cycle === 'monthly') return addMonthsClamped(anchor, n);
  return addMonthsClamped(anchor, 12 * n);
}

// Count from the original date so a bill on the 31st doesn't drift to the 28th after February.
export function nextChargeDate(sub: Subscription, today: Date): Date {
  const anchor = parseDate(sub.nextCharge);
  const day = startOfDay(today);
  let n = 0;
  let charge = anchor;
  while (charge < day) {
    n += 1;
    charge = chargeAt(anchor, sub.cycle, n);
  }
  return charge;
}

export function totalDueWithin(subs: Subscription[], today: Date, days: number): number {
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + days);
  let total = 0;
  for (const sub of subs) {
    const anchor = parseDate(sub.nextCharge);
    const first = nextChargeDate(sub, today);
    let n = 0;
    while (chargeAt(anchor, sub.cycle, n) < first) n += 1;
    for (let charge = first; charge <= end; n += 1, charge = chargeAt(anchor, sub.cycle, n)) total += sub.cost;
  }
  return Math.round(total * 100) / 100;
}

export function daysUntil(date: Date, today: Date): number {
  return Math.round((startOfDay(date).getTime() - startOfDay(today).getTime()) / MS_PER_DAY);
}

export function monthlyCost(sub: Pick<Subscription, 'cost' | 'cycle'>): number {
  if (sub.cycle === 'weekly') return (sub.cost * 52) / 12;
  if (sub.cycle === 'yearly') return sub.cost / 12;
  return sub.cost;
}

export function totalMonthly(subs: Subscription[]): number {
  return subs.reduce((sum, s) => sum + monthlyCost(s), 0);
}

export interface UpcomingCharge {
  sub: Subscription;
  date: Date;
  daysLeft: number;
}

export function upcomingCharges(subs: Subscription[], today: Date, withinDays: number): UpcomingCharge[] {
  return subs
    .map((sub) => {
      const date = nextChargeDate(sub, today);
      return { sub, date, daysLeft: daysUntil(date, today) };
    })
    .filter((c) => c.daysLeft <= withinDays)
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

export function dueReminders(subs: Subscription[], today: Date, reminderDays = 3): UpcomingCharge[] {
  return upcomingCharges(subs, today, reminderDays);
}

export function costByCategory(subs: Subscription[]): { category: Category; monthly: number }[] {
  const totals = new Map<Category, number>();
  for (const s of subs) totals.set(s.category, (totals.get(s.category) ?? 0) + monthlyCost(s));
  return [...totals.entries()]
    .map(([category, monthly]) => ({ category, monthly: Math.round(monthly * 100) / 100 }))
    .sort((a, b) => b.monthly - a.monthly);
}

export function chargesInMonth(subs: Subscription[], year: number, month: number): Map<number, Subscription[]> {
  const byDay = new Map<number, Subscription[]>();
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  for (const sub of subs) {
    const anchor = parseDate(sub.nextCharge);
    // Trials only bill from their end date forward.
    let n = 0;
    let charge = anchor;
    if (!sub.isTrial) {
      while (charge > monthStart) {
        n -= 1;
        charge = chargeAt(anchor, sub.cycle, n);
      }
    }
    while (charge <= monthEnd) {
      if (charge >= monthStart) {
        const list = byDay.get(charge.getDate()) ?? [];
        list.push(sub);
        byDay.set(charge.getDate(), list);
      }
      n += 1;
      charge = chargeAt(anchor, sub.cycle, n);
    }
  }
  return byDay;
}

export function formatMoney(amount: number): string {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}
