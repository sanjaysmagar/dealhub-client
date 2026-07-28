import { configureStore } from '@reduxjs/toolkit';
import authReducer    from './slices/authSlice';
import dealsReducer   from './slices/dealsSlice';
import rewardsReducer from './slices/rewardsSlice';
import affiliateReducer from './slices/affiliateSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth:    authReducer,
    deals:   dealsReducer,
    rewards: rewardsReducer,
    affiliate: affiliateReducer,
    notifications: notificationReducer,
  },
});