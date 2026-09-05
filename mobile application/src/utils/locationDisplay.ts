import type { LocationResult } from '../types/location';
import { formatLocationDisplay } from './readableAddress';

export function formatLocationLabel(
  location: Pick<LocationResult, 'address' | 'city' | 'state' | 'displayLabel'>,
): string {
  return formatLocationDisplay({
    address: location.address,
    displayLabel: location.displayLabel,
    label: location.city && location.state ? `${location.city}, ${location.state}` : undefined,
  });
}
