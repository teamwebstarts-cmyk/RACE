import type { BookingLocation } from '../types/serviceBooking';
import { BHUBANESWAR_DEFAULT } from './googleMaps';

// Default map center — only used when GPS permission is denied or coords are missing.
// Never sent to POST /api/v1/bookings/* unless the user explicitly selects a location on the map.
const DEFAULT_LATITUDE = BHUBANESWAR_DEFAULT.latitude;
const DEFAULT_LONGITUDE = BHUBANESWAR_DEFAULT.longitude;

/** Requires real coordinates — use when submitting bookings to the API. */
export function requireBookingLocation(
  address: string,
  latitude: number | undefined,
  longitude: number | undefined,
  label = 'location',
): BookingLocation {
  const trimmed = address.trim();
  if (!trimmed) {
    throw new Error(`${label} address is required`);
  }
  if (latitude == null || longitude == null) {
    throw new Error(`Select ${label} on the map to set coordinates`);
  }
  return {
    address: trimmed,
    latitude,
    longitude,
  };
}

export function addressToBookingLocation(
  address: string,
  latitude?: number,
  longitude?: number,
  offset = 0,
): BookingLocation {
  return {
    address: address.trim(),
    latitude: latitude ?? DEFAULT_LATITUDE + offset,
    longitude: longitude ?? DEFAULT_LONGITUDE + offset * 0.5,
  };
}

export function buildFutureScheduledAt(daysAhead = 1, hour = 10): string {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

export function towingDateIdToScheduledAt(dateId: string): string | undefined {
  if (dateId === 'today') {
    const date = new Date();
    date.setHours(date.getHours() + 2, 0, 0, 0);
    return date.toISOString();
  }
  return buildFutureScheduledAt(1);
}

export function driverDateIdToScheduledAt(dateId: string): string | undefined {
  if (dateId === 'today') {
    return undefined;
  }
  return buildFutureScheduledAt(1, 9);
}
