import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { getApiErrorMessage } from '../services/api';
import {
  completeAdvancePayment,
  createDriverBooking,
  createTowingBooking,
} from '../services/bookings/serviceBookingApi';
import type {
  CreateDriverBookingRequest,
  CreateTowingBookingRequest,
  ServiceBooking,
  ServiceBookingType,
} from '../types/serviceBooking';

interface ConfirmResult {
  booking: ServiceBooking;
}

export function useServiceBookingPayment() {
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmTowing = useCallback(async (payload: CreateTowingBookingRequest) => {
    setIsConfirming(true);
    setError(null);
    try {
      const booking = await createTowingBooking(payload);
      await completeAdvancePayment(booking.id, 'towing');
      return { booking } satisfies ConfirmResult;
    } catch (err) {
      const message = getApiErrorMessage(err, 'Unable to confirm towing booking');
      setError(message);
      Alert.alert('Booking failed', message);
      throw err;
    } finally {
      setIsConfirming(false);
    }
  }, []);

  const confirmDriver = useCallback(async (payload: CreateDriverBookingRequest) => {
    setIsConfirming(true);
    setError(null);
    try {
      const booking = await createDriverBooking(payload);
      await completeAdvancePayment(booking.id, 'driver');
      return { booking } satisfies ConfirmResult;
    } catch (err) {
      const message = getApiErrorMessage(err, 'Unable to confirm driver booking');
      setError(message);
      Alert.alert('Booking failed', message);
      throw err;
    } finally {
      setIsConfirming(false);
    }
  }, []);

  const confirmExistingBooking = useCallback(
    async (bookingId: string, bookingType: ServiceBookingType) => {
      setIsConfirming(true);
      setError(null);
      try {
        await completeAdvancePayment(bookingId, bookingType);
      } catch (err) {
        const message = getApiErrorMessage(err, 'Payment failed');
        setError(message);
        Alert.alert('Payment failed', message);
        throw err;
      } finally {
        setIsConfirming(false);
      }
    },
    [],
  );

  return {
    confirmTowing,
    confirmDriver,
    confirmExistingBooking,
    isConfirming,
    error,
  };
}
