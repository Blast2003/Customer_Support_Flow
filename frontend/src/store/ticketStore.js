import { create } from "zustand";

export const useTicketStore = create((set) => ({
  tickets: [],
  selectedTicket: null,
  loading: false,
  error: null,

  setTickets: (tickets) => set({ tickets }),
  setSelectedTicket: (selectedTicket) => set({ selectedTicket }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  addTicket: (ticket) =>
    set((state) => ({
      tickets: [ticket, ...state.tickets],
    })),

  updateTicket: (updatedTicket) =>
    set((state) => ({
      tickets: state.tickets.map((ticket) =>
        ticket.id === updatedTicket.id ? updatedTicket : ticket
      ),
      selectedTicket:
        state.selectedTicket?.id === updatedTicket.id
          ? updatedTicket
          : state.selectedTicket,
    })),

  markSelectedTicketMessagesSeen: (ticketId) =>
  set((state) => {
    if (!state.selectedTicket || String(state.selectedTicket.id) !== String(ticketId)) {
      return state;
    }

    return {
      selectedTicket: {
        ...state.selectedTicket,
        messages: (state.selectedTicket.messages || []).map((msg) => ({
          ...msg,
          seen: true,
        })),
      },
    };
  }),

  removeTicket: (id) =>
    set((state) => ({
      tickets: state.tickets.filter((ticket) => ticket.id !== id),
    })),
}));