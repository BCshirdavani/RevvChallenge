import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import donationReducer from '../features/data/donationSlice';

export const store = configureStore({
  reducer: {
    donations: donationReducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware({serializableCheck: false}),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
