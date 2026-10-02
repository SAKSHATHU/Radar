import { formatMoney, type UpcomingCharge } from './billing';

export function reminderText(c: UpcomingCharge): string {
  const when = c.daysLeft === 0 ? 'today' : c.daysLeft === 1 ? 'tomorrow' : `in ${c.daysLeft} days`;
  return c.sub.isTrial
    ? `${c.sub.name} trial ends ${when}. Cancel now to avoid a ${formatMoney(c.sub.cost)} charge.`
    : `${c.sub.name} charges ${formatMoney(c.sub.cost)} ${when}.`;
}
