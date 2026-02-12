import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Customer {
  id: string;
  name: string;
  email?: string | null;
  phone?: string;
  address?: string;
  createdAt?: string;
}

interface CustomersState {
  items: Customer[];
}

const initialState: CustomersState = {
  items: [],
};

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    addCustomer: (state, action: PayloadAction<Customer | Omit<Customer, 'id'>>) => {
      const customer = action.payload;
      const id = 'id' in customer ? customer.id : String(Date.now());
      state.items.push({ ...customer, id } as Customer);
    },
    updateCustomer: (state, action: PayloadAction<Customer>) => {
      const index = state.items.findIndex((item) => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteCustomer: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    setCustomers: (state, action: PayloadAction<Customer[]>) => {
      state.items = action.payload;
    },
  },
});

export const { addCustomer, updateCustomer, deleteCustomer, setCustomers } = customersSlice.actions;
export default customersSlice.reducer;
