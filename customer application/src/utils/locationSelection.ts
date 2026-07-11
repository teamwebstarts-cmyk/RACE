import type { LocationResult } from '../types/location';
import { formatReadableAddress } from './readableAddress';

export interface ResolvedLocationSelection {
  address: string;
  displayLabel: string;
}

/** Normalize map/search selection for storage + UI labels. */
export function resolveLocationSelection(location: LocationResult): ResolvedLocationSelection {
  const address = location.address.trim();
  const displayLabel =
    location.displayLabel?.trim() ||
    formatReadableAddress(address);

  return { address, displayLabel };
}
