import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';
import type { NewSubscription, Subscription } from '../types';

export interface SubscriptionsState {
  items: Subscription[];
}

const initialState: SubscriptionsState = { items: [] };

const subscriptionsSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    addSubscription: {
      reducer(state, action: PayloadAction<Subscription>) {
        state.items.push(action.payload);
      },
      prepare(sub: NewSubscription) {
        return { payload: { ...sub, id: nanoid() } };
      },
    },
    updateSubscription(state, action: PayloadAction<Subscription>) {
      const i = state.items.findIndex((s) => s.id === action.payload.id);
      if (i !== -1) state.items[i] = action.payload;
    },
    removeSubscription(state, action: PayloadAction<string>) {
      state.items = state.items.filter((s) => s.id !== action.payload);
    },
  },
});

export const { addSubscription, updateSubscription, removeSubscription } = subscriptionsSlice.actions;
export default subscriptionsSlice.reducer;
