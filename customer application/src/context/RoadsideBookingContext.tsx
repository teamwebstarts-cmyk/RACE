import React, { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { DEFAULT_ROADSIDE_BOOKING, type RoadsideBookingState } from '../types/roadsideBooking';

interface RoadsideBookingContextValue {
  booking: RoadsideBookingState;
  updateBooking: (patch: Partial<RoadsideBookingState>) => void;
  resetBooking: () => void;
}

const RoadsideBookingContext = createContext<RoadsideBookingContextValue | null>(null);

export function RoadsideBookingProvider({ children }: { children: ReactNode }) {
  const [booking, setBooking] = useState<RoadsideBookingState>(DEFAULT_ROADSIDE_BOOKING);

  const value = useMemo(
    () => ({
      booking,
      updateBooking: (patch: Partial<RoadsideBookingState>) => {
        setBooking(prev => ({ ...prev, ...patch }));
      },
      resetBooking: () => setBooking(DEFAULT_ROADSIDE_BOOKING),
    }),
    [booking],
  );

  return (
    <RoadsideBookingContext.Provider value={value}>{children}</RoadsideBookingContext.Provider>
  );
}

export function useRoadsideBooking() {
  const ctx = useContext(RoadsideBookingContext);
  if (!ctx) {
    throw new Error('useRoadsideBooking must be used within RoadsideBookingProvider');
  }
  return ctx;
}
