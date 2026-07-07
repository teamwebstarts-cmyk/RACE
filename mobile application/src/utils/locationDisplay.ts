import type { LocationResult } from '../types/location';

export function formatLocationLabel(location: Pick<LocationResult, 'address' | 'city' | 'state'>): string {
  if (location.city && location.state) {
    return `${location.city}, ${location.state}`;
  }

  const parts = location.address
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[parts.length - 2]}, ${parts[parts.length - 1]}`;
  }

  return location.address;
}
