import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import subscriptionsReducer, { type SubscriptionsState } from './subscriptionsSlice';

const STORAGE_KEY = 'subscription-radar:v1';

function loadState(): { subscriptions: SubscriptionsState } | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { subscriptions: JSON.parse(raw) as SubscriptionsState } : undefined;
  } catch {
    return undefined;
  }
}

export function makeStore(preloaded = loadState()) {
  return configureStore({
    reducer: { subscriptions: subscriptionsReducer },
    preloadedState: preloaded,
  });
}

export const store = makeStore();

store.subscribe(() => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store.getState().subscriptions));
  } catch {
    // Storage can be blocked in private mode.
  }
});

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
