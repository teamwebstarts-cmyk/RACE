import type { Booking } from '../types/booking';

export interface RecentPickupLocation {
  id: string;
  title: string;
  address: string;
  latitude: number;
  longitude: number;
}

function shortTitle(address: string): string {
  const first = address.split(',')[0]?.trim() || address.trim();
  return first.length > 36 ? `${first.slice(0, 36).trim()}…` : first;
}

function locationKey(latitude: number, longitude: number, address: string): string {
  return `${latitude.toFixed(4)},${longitude.toFixed(4)}|${address.trim().toLowerCase()}`;
}

/**
 * Unique recent pickup points from this user's past driver-hire bookings.
 * Newest bookings first; max `limit` items.
 */
export function getRecentDriverPickups(
  bookings: Booking[] | undefined,
  limit = 5,
): RecentPickupLocation[] {
  if (!bookings?.length) return [];

  const driverBookings = bookings
    .filter(b => (b.bookingType ?? 'driver') === 'driver')
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const seen = new Set<string>();
  const recent: RecentPickupLocation[] = [];

  for (const booking of driverBookings) {
    const lat = booking.pickup?.latitude;
    const lng = booking.pickup?.longitude;
    const address = booking.pickup?.address?.trim();
    if (lat == null || lng == null || !address) continue;

    const key = locationKey(lat, lng, address);
    if (seen.has(key)) continue;
    seen.add(key);

    recent.push({
      id: `${booking.id}-pickup`,
      title: booking.pickup.label || shortTitle(address),
      address,
      latitude: lat,
      longitude: lng,
    });

    if (recent.length >= limit) break;
  }

  return recent;
}
