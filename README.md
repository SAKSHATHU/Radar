# Subscription Radar

Free trials and forgotten subscriptions quietly drain money. Subscription Radar tracks every plan in one place, shows what you really spend each month, and warns you **3 days before** any charge or trial conversion.

## Features
- **Add, edit, and delete subscriptions** with validated forms (weekly, monthly, or yearly billing)
- **Free trial tracking** that flags the date a trial turns into a paid plan
- **Reminders** in the app plus optional browser notifications, sent once per charge
- **Monthly cost by category** chart with tooltips and an accessible table view
- **Renewal calendar** with month navigation and every repeat charge placed on its day
- **Totals** per month, per year, and for the next 30 days (weekly plans counted every time they bill)
- Data saved in the browser with `localStorage`, light and dark mode, responsive layout

## Tech stack
React 19, TypeScript, Redux Toolkit, Tailwind CSS 4, Recharts, Vite, Jest + React Testing Library, GitHub Actions CI.

## Getting started
```bash
npm install
npm run dev      # start the app
npm test         # run unit and component tests
npm run build    # type-check and build for production
```

## Engineering notes
- **Billing date logic** lives in `src/lib/billing.ts` as pure functions with unit tests. Monthly charges are counted from the original date, so a bill on the 31st stays on the 31st after February instead of drifting to the 28th.
- **Code splitting:** the chart library loads in its own chunk after first paint, which cut the initial bundle from about 612 KB to 270 KB.
- **Reminders:** browser notifications fire when the app is open (checked hourly). Background push reminders would need a service worker and a server, which is a planned next step.

## Roadmap
- Cypress end-to-end tests for the add and remind flows
- Push notifications through a service worker
- CSV import from bank statements
