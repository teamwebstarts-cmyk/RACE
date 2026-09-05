import type { RoadsideServiceId } from '../types/roadsideBooking';

const ROADSIDE_SERVICE_SLUGS: Record<RoadsideServiceId, string> = {
  flat_tyre: 'roadside_flat_tyre',
  battery: 'roadside_battery_jump',
  fuel: 'roadside_fuel_delivery',
  minor_repairs: 'roadside_minor_repair',
};

const TOWING_ROADSIDE_SLUGS = new Set([
  'towing',
  'towing_instant',
  'towing_scheduled',
  'towing_emergency',
]);

export function isTowingRoadsideSlug(serviceType: string): boolean {
  return TOWING_ROADSIDE_SLUGS.has(serviceType.trim().toLowerCase());
}

export function roadsideServiceIdToSlug(serviceId: RoadsideServiceId): string {
  return ROADSIDE_SERVICE_SLUGS[serviceId];
}
