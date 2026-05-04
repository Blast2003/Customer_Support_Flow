import { create } from "zustand";

export const useCustomerStore = create((set) => ({
  customers: [],
  selectedCustomer: null,
  loading: false,
  error: null,

  setCustomers: (customers) => set({ customers }),
  setSelectedCustomer: (selectedCustomer) => set({ selectedCustomer }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  addCustomer: (customer) =>
    set((state) => ({
      customers: [customer, ...state.customers],
    })),

  updateCustomer: (updatedCustomer) =>
    set((state) => ({
      customers: state.customers.map((customer) =>
        customer.id === updatedCustomer.id ? updatedCustomer : customer
      ),
      selectedCustomer:
        state.selectedCustomer?.id === updatedCustomer.id
          ? updatedCustomer
          : state.selectedCustomer,
    })),
}));