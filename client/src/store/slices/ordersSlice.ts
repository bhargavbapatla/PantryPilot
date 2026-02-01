import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RecipeItem } from './recipesSlice';

export type OrderStatus = 'Pending' | 'Completed' | 'Cancelled';

export interface OrderItem {
  id: string;
  productIds: string[];
  products?: RecipeItem[];
  customerName: string;
  phoneNumber?: string;
  address?: string;
  orderDate: string;
  status: OrderStatus;
  totalAmount: number;
}

interface OrdersState {
  items: OrderItem[];
}

const initialState: OrdersState = {
  items: [],
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    addOrder: (state, action: PayloadAction<OrderItem | Omit<OrderItem, 'id'>>) => {
      const order = action.payload;
      const id = 'id' in order ? order.id : String(Date.now());
      state.items.push({ ...order, id } as OrderItem);
    },
    updateOrder: (state, action: PayloadAction<OrderItem>) => {
      const index = state.items.findIndex((item) => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteOrder: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    setOrders: (state, action: PayloadAction<OrderItem[]>) => {
      state.items = action.payload;
    },
  },
});

export const { addOrder, updateOrder, deleteOrder, setOrders } = ordersSlice.actions;
export default ordersSlice.reducer;

