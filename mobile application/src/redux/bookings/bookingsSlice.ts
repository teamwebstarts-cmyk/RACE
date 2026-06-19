import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Booking, BookingDraft, BookingStatus } from '../../types/booking';

export interface BookingsState {
  items: Booking[];
  activeBookingId: string | null;
  draft: BookingDraft | null;
  loading: boolean;
}

const initialState: BookingsState = {
  items: [],
  activeBookingId: null,
  draft: null,
  loading: false,
};

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    setBookingsLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setBookings(state, action: PayloadAction<Booking[]>) {
      state.items = action.payload;
      state.loading = false;
    },
    addBooking(state, action: PayloadAction<Booking>) {
      state.items = [action.payload, ...state.items];
      state.activeBookingId = action.payload.id;
      state.draft = null;
    },
    updateBooking(state, action: PayloadAction<Booking>) {
      const index = state.items.findIndex((b) => b.id === action.payload.id);
      if (index >= 0) {
        state.items[index] = action.payload;
      }
    },
    updateBookingStatus(
      state,
      action: PayloadAction<{ id: string; status: BookingStatus; etaMinutes?: number }>,
    ) {
      const booking = state.items.find((b) => b.id === action.payload.id);
      if (!booking) return;
      booking.status = action.payload.status;
      if (action.payload.etaMinutes !== undefined) {
        booking.etaMinutes = action.payload.etaMinutes;
      }
      booking.updatedAt = new Date().toISOString();
    },
    setActiveBooking(state, action: PayloadAction<string | null>) {
      state.activeBookingId = action.payload;
    },
    setBookingDraft(state, action: PayloadAction<BookingDraft | null>) {
      state.draft = action.payload;
    },
    updateBookingDraft(state, action: PayloadAction<Partial<BookingDraft>>) {
      state.draft = { ...(state.draft ?? {}), ...action.payload } as BookingDraft;
    },
    clearBookingDraft(state) {
      state.draft = null;
    },
    resetBookings(state) {
      state.items = [];
      state.activeBookingId = null;
      state.draft = null;
      state.loading = false;
    },
  },
});

export const {
  setBookingsLoading,
  setBookings,
  addBooking,
  updateBooking,
  updateBookingStatus,
  setActiveBooking,
  setBookingDraft,
  updateBookingDraft,
  clearBookingDraft,
  resetBookings,
} = bookingsSlice.actions;

export default bookingsSlice.reducer;
