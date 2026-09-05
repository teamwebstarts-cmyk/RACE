import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { getApiErrorMessage } from '../services/api';
import { completeFinalPayment } from '../services/bookings/serviceBookingApi';
import type { ServiceBookingType } from '../types/serviceBooking';

export function useFinalPayment() {
  const [isPaying, setIsPaying] = useState(false);

  const payRemaining = useCallback(async (bookingId: string, bookingType: ServiceBookingType) => {
    setIsPaying(true);
    try {
      await completeFinalPayment(bookingId, bookingType);
      return true;
    } catch (err) {
      Alert.alert('Payment failed', getApiErrorMessage(err, 'Unable to process final payment'));
      return false;
    } finally {
      setIsPaying(false);
    }
  }, []);

  return { payRemaining, isPaying };
}
