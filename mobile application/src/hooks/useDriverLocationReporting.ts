import { useEffect } from 'react';
import * as Location from 'expo-location';

import { useUpdateDriverLocationMutation } from '../services/driver/useDriverQueries';

const REPORT_INTERVAL_MS = 12_000;

/**
 * Reports driver GPS to the backend while online or on an active job.
 * Backend emits socket updates to the customer's tracking screen.
 */
export function useDriverLocationReporting(enabled: boolean) {
  const { mutateAsync } = useUpdateDriverLocationMutation();

  useEffect(() => {
    if (!enabled) return undefined;

    let cancelled = false;

    const report = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted' || cancelled) return;

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (cancelled) return;

        await mutateAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      } catch {
        // Permission denied or GPS unavailable — skip silently.
      }
    };

    void report();
    const interval = setInterval(() => {
      void report();
    }, REPORT_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [enabled, mutateAsync]);
}
