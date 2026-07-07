import { useEffect, useState } from 'react';

import { trackingService } from '../services/tracking/trackingService';

export function useBookingTracking(bookingId?: string, bookingType?: 'towing' | 'driver') {
  const [status, setStatus] = useState<string>('CONFIRMED');
  const [etaMinutes, setEtaMinutes] = useState(15);
  const [driverLocation, setDriverLocation] = useState<
    { latitude: number; longitude: number; driverName?: string; driverPhone?: string } | undefined
  >();

  useEffect(() => {
    if (!bookingId) return undefined;

    const unsubscribe = trackingService.subscribe(bookingId, (update) => {
      setStatus(update.status);
      setEtaMinutes(update.etaMinutes);
      setDriverLocation(update.driverLocation);
    }, bookingType);

    return unsubscribe;
  }, [bookingId, bookingType]);

  return {
    status,
    etaMinutes,
    etaLabel: `${etaMinutes} min`,
    driverLocation,
  };
}
