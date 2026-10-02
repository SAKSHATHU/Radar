import {
  addMonthsClamped,
  chargesInMonth,
  costByCategory,
  dueReminders,
  monthlyCost,
  nextChargeDate,
  parseDate,
  toISODate,
  totalDueWithin,
  totalMonthly,
} from './billing';
import type { Subscription } from '../types';

const sub = (over: Partial<Subscription> = {}): Subscription => ({
  id: over.id ?? 'x',
  name: 'Netflix',
  cost: 15.49,
  cycle: 'monthly',
  category: 'Streaming',
  nextCharge: '2026-10-05',
  isTrial: false,
  ...over,
});

const today = parseDate('2026-10-01');

describe('date helpers', () => {
  it('parses YYYY-MM-DD as a local date without shifting the day', () => {
    expect(toISODate(parseDate('2026-01-05'))).toBe('2026-01-05');
  });

  it('clamps month-end dates instead of overflowing', () => {
    expect(toISODate(addMonthsClamped(parseDate('2026-01-31'), 1))).toBe('2026-02-28');
    expect(toISODate(addMonthsClamped(parseDate('2028-01-31'), 1))).toBe('2028-02-29');
  });
});

describe('nextChargeDate', () => {
  it('returns the stored date when it is still ahead', () => {
    expect(toISODate(nextChargeDate(sub(), today))).toBe('2026-10-05');
  });

  it('rolls a past monthly date forward to the next cycle', () => {
    expect(toISODate(nextChargeDate(sub({ nextCharge: '2026-08-15' }), today))).toBe('2026-10-15');
  });

  it('keeps a 31st-of-month bill on the 31st after a short month', () => {
    const s = sub({ nextCharge: '2026-01-31' });
    expect(toISODate(nextChargeDate(s, parseDate('2026-03-01')))).toBe('2026-03-31');
  });

  it('rolls weekly and yearly plans by their own cycle', () => {
    expect(toISODate(nextChargeDate(sub({ cycle: 'weekly', nextCharge: '2026-09-20' }), today))).toBe('2026-10-04');
    expect(toISODate(nextChargeDate(sub({ cycle: 'yearly', nextCharge: '2025-03-10' }), today))).toBe('2027-03-10');
  });

  it('treats a charge due today as due today', () => {
    expect(toISODate(nextChargeDate(sub({ nextCharge: '2026-10-01' }), today))).toBe('2026-10-01');
  });
});

describe('costs', () => {
  it('normalizes every cycle to a monthly cost', () => {
    expect(monthlyCost({ cost: 12, cycle: 'monthly' })).toBe(12);
    expect(monthlyCost({ cost: 120, cycle: 'yearly' })).toBe(10);
    expect(monthlyCost({ cost: 3, cycle: 'weekly' })).toBeCloseTo(13, 5);
  });

  it('sums the monthly total across plans', () => {
    expect(totalMonthly([sub({ cost: 10 }), sub({ cost: 120, cycle: 'yearly' })])).toBe(20);
  });

  it('groups spend by category, largest first', () => {
    const result = costByCategory([
      sub({ category: 'Music', cost: 10.99 }),
      sub({ category: 'Streaming', cost: 15.49 }),
      sub({ category: 'Streaming', cost: 7.99 }),
    ]);
    expect(result).toEqual([
      { category: 'Streaming', monthly: 23.48 },
      { category: 'Music', monthly: 10.99 },
    ]);
  });

  it('counts every weekly repeat in the next 30 days', () => {
    // Window is Oct 1 to Oct 31: charges land on Oct 4, 11, 18, and 25.
    expect(totalDueWithin([sub({ cycle: 'weekly', cost: 5, nextCharge: '2026-10-04' })], today, 30)).toBe(20);
  });
});

describe('reminders', () => {
  it('flags charges within 3 days, including trials, soonest first', () => {
    const due = dueReminders(
      [
        sub({ id: 'a', name: 'Gym', nextCharge: '2026-10-04' }),
        sub({ id: 'b', name: 'Trial', nextCharge: '2026-10-02', isTrial: true }),
        sub({ id: 'c', name: 'Later', nextCharge: '2026-10-09' }),
      ],
      today,
    );
    expect(due.map((d) => [d.sub.name, d.daysLeft])).toEqual([
      ['Trial', 1],
      ['Gym', 3],
    ]);
  });
});

describe('chargesInMonth', () => {
  it('places weekly charges on every matching day of the month', () => {
    const map = chargesInMonth([sub({ cycle: 'weekly', nextCharge: '2026-10-04' })], 2026, 9);
    expect([...map.keys()].sort((a, b) => a - b)).toEqual([4, 11, 18, 25]);
  });

  it('does not show charges for a trial before it converts', () => {
    const map = chargesInMonth([sub({ isTrial: true, nextCharge: '2026-11-10' })], 2026, 9);
    expect(map.size).toBe(0);
  });
});
