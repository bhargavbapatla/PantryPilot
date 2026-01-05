import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface InventoryState {
  lowStockThreshold: number;
  lastSync: string | null;
}

const initialState: InventoryState = {
  lowStockThreshold: 10, // Default: Warn if below 10 units
  lastSync: null,
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setThreshold: (state, action: PayloadAction<number>) => {
      state.lowStockThreshold = action.payload;
    },
    updateSyncTime: (state) => {
      state.lastSync = new Date().toISOString();
    },
  },
});

export const { setThreshold, updateSyncTime } = inventorySlice.actions;
export default inventorySlice.reducer;