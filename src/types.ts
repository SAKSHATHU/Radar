export type BillingCycle = 'weekly' | 'monthly' | 'yearly';

export type Category =
  | 'Streaming'
  | 'Music'
  | 'Fitness'
  | 'Phone & Internet'
  | 'Software'
  | 'Other';

export const CATEGORIES: Category[] = [
  'Streaming',
  'Music',
  'Fitness',
  'Phone & Internet',
  'Software',
  'Other',
];

export interface Subscription {
  id: string;
  name: string;
  cost: number;
  cycle: BillingCycle;
  category: Category;
  /** YYYY-MM-DD. For a free trial, the date it converts to paid. */
  nextCharge: string;
  isTrial: boolean;
}

export type NewSubscription = Omit<Subscription, 'id'>;
