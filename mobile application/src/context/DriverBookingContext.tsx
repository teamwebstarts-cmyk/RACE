import React, { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { DEFAULT_DRIVER_BOOKING, type DriverBookingState } from '../types/driverBooking';

interface DriverBookingContextValue {
  booking: DriverBookingState;
  updateBooking: (patch: Partial<DriverBookingState>) => void;
  resetBooking: () => void;
}

const DriverBookingContext = createContext<DriverBookingContextValue | null>(null);

export function DriverBookingProvider({ children }: { children: ReactNode }) {
  const [booking, setBooking] = useState<DriverBookingState>(DEFAULT_DRIVER_BOOKING);

  const value = useMemo(
    () => ({
      booking,
      updateBooking: (patch: Partial<DriverBookingState>) => {
        setBooking(prev => ({ ...prev, ...patch }));
      },
      resetBooking: () => setBooking(DEFAULT_DRIVER_BOOKING),
    }),
    [booking],
  );

  return (
    <DriverBookingContext.Provider value={value}>{children}</DriverBookingContext.Provider>
  );
}

export function useDriverBooking() {
  const ctx = useContext(DriverBookingContext);
  if (!ctx) {
    throw new Error('useDriverBooking must be used within DriverBookingProvider');
  }
  return ctx;
}
