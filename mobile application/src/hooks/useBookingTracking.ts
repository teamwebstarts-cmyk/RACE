import { useEffect, useState } from 'react';

import { trackingService } from '../services/tracking/trackingService';

export interface TrackedDriver {
  id: string;
  name: string;
  phone: string;
  rating: number;
}

export function useBookingTracking(bookingId?: string, bookingType?: 'towing' | 'driver') {
  const [status, setStatus] = useState<string>('CONFIRMED');
  const [etaMinutes, setEtaMinutes] = useState(15);
  const [driver, setDriver] = useState<TrackedDriver | undefined>();
  const [driverLocation, setDriverLocation] = useState<
    { latitude: number; longitude: number; driverName?: string; driverPhone?: string } | undefined
  >();

  useEffect(() => {
    if (!bookingId) return undefined;

    const unsubscribe = trackingService.subscribe(bookingId, (update) => {
      setStatus(update.status);
      setEtaMinutes(update.etaMinutes);
      if (update.driver) {
        setDriver(update.driver);
      } else if (update.driverLocation?.driverName) {
        setDriver(prev => ({
          id: prev?.id ?? '',
          name: update.driverLocation!.driverName!,
          phone: update.driverLocation?.driverPhone ?? prev?.phone ?? '',
          rating: prev?.rating ?? 4.8,
        }));
      }
      setDriverLocation(update.driverLocation);
    }, bookingType);

    return unsubscribe;
  }, [bookingId, bookingType]);

  const resolvedDriverName =
    driver?.name ?? driverLocation?.driverName ?? undefined;

  return {
    status,
    etaMinutes,
    etaLabel: `${etaMinutes} min`,
    driver,
    driverName: resolvedDriverName,
    driverPhone: driver?.phone ?? driverLocation?.driverPhone,
    driverRating: driver?.rating ?? 4.8,
    driverLocation,
  };
}
