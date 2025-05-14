import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import taskReducer from './taskSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    tasks: taskReducer
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false, // Allow non-serializable values for user object
    }),
});