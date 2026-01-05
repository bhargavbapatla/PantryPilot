import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import inventoryReducer from './slices/inventorySlice';
import { apiSlice } from './api/apiSlice'; // Advanced caching (see point 4)

export const store = configureStore({
  reducer: {
    inventory: inventoryReducer,
    // Connect the RTK Query API reducer
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  // Adding the api middleware enables caching, invalidation, polling, etc.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

setupListeners(store.dispatch);

// Types for TypeScript usage
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;