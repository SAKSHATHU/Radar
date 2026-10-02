import { useState, type FormEvent } from 'react';
import { validate, type Errors } from '../lib/validation';
import { CATEGORIES, type BillingCycle, type Category, type NewSubscription } from '../types';

interface Props {
  initial?: NewSubscription;
  onSubmit: (sub: NewSubscription) => void;
  onCancel?: () => void;
}

const EMPTY: NewSubscription = {
  name: '',
  cost: 0,
  cycle: 'monthly',
  category: 'Streaming',
  nextCharge: '',
  isTrial: false,
};

const field =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 ' +
  'focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 ' +
  'dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100';

export function SubscriptionForm({ initial, onSubmit, onCancel }: Props) {
  const start = initial ?? EMPTY;
  const [name, setName] = useState(start.name);
  const [cost, setCost] = useState(initial ? String(initial.cost) : '');
  const [cycle, setCycle] = useState<BillingCycle>(start.cycle);
  const [category, setCategory] = useState<Category>(start.category);
  const [nextCharge, setNextCharge] = useState(start.nextCharge);
  const [isTrial, setIsTrial] = useState(start.isTrial);
  const [errors, setErrors] = useState<Errors>({});

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validate({ name, cost, nextCharge });
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    onSubmit({ name: name.trim(), cost: Number(cost), cycle, category, nextCharge, isTrial });
    if (!initial) {
      setName('');
      setCost('');
      setNextCharge('');
      setIsTrial(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-3 sm:grid-cols-2" aria-label="Subscription form">
      <label className="grid gap-1 text-sm sm:col-span-2">
        <span className="font-medium text-stone-700 dark:text-stone-300">Name</span>
        <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Netflix" aria-invalid={!!errors.name} />
        {errors.name && <span className="text-xs text-red-700 dark:text-red-400">{errors.name}</span>}
      </label>

      <label className="grid gap-1 text-sm">
        <span className="font-medium text-stone-700 dark:text-stone-300">Cost (USD)</span>
        <input className={field} type="number" min="0" step="0.01" inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="15.49" aria-invalid={!!errors.cost} />
        {errors.cost && <span className="text-xs text-red-700 dark:text-red-400">{errors.cost}</span>}
      </label>

      <label className="grid gap-1 text-sm">
        <span className="font-medium text-stone-700 dark:text-stone-300">Billing cycle</span>
        <select className={field} value={cycle} onChange={(e) => setCycle(e.target.value as BillingCycle)}>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </label>

      <label className="grid gap-1 text-sm">
        <span className="font-medium text-stone-700 dark:text-stone-300">Category</span>
        <select className={field} value={category} onChange={(e) => setCategory(e.target.value as Category)}>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>

      <label className="grid gap-1 text-sm">
        <span className="font-medium text-stone-700 dark:text-stone-300">{isTrial ? 'Trial ends (first charge)' : 'Next charge'}</span>
        <input className={field} type="date" value={nextCharge} onChange={(e) => setNextCharge(e.target.value)} aria-invalid={!!errors.nextCharge} />
        {errors.nextCharge && <span className="text-xs text-red-700 dark:text-red-400">{errors.nextCharge}</span>}
      </label>

      <label className="flex items-center gap-2 text-sm text-stone-700 sm:col-span-2 dark:text-stone-300">
        <input type="checkbox" className="size-4 accent-blue-600" checked={isTrial} onChange={(e) => setIsTrial(e.target.checked)} />
        This is a free trial
      </label>

      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          {initial ? 'Save changes' : 'Add subscription'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
