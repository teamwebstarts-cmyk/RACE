import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { DEFAULT_TOWING_BOOKING, type TowingBookingState } from '../types/towingBooking';

interface TowingBookingContextValue {
  booking: TowingBookingState;
  updateBooking: (patch: Partial<TowingBookingState>) => void;
  resetBooking: () => void;
}

const TowingBookingContext = createContext<TowingBookingContextValue | null>(null);

export function TowingBookingProvider({ children }: { children: ReactNode }) {
  const [booking, setBooking] = useState<TowingBookingState>(DEFAULT_TOWING_BOOKING);

  const updateBooking = useCallback((patch: Partial<TowingBookingState>) => {
    setBooking(prev => ({ ...prev, ...patch }));
  }, []);

  const resetBooking = useCallback(() => {
    setBooking(DEFAULT_TOWING_BOOKING);
  }, []);

  const value = useMemo(
    () => ({
      booking,
      updateBooking,
      resetBooking,
    }),
    [booking, updateBooking, resetBooking],
  );

  return (
    <TowingBookingContext.Provider value={value}>{children}</TowingBookingContext.Provider>
  );
}

export function useTowingBooking() {
  const ctx = useContext(TowingBookingContext);
  if (!ctx) {
    throw new Error('useTowingBooking must be used within TowingBookingProvider');
  }
  return ctx;
}
