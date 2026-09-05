import type { VehicleType } from '../types/vehicle';

export const VEHICLE_SUBTYPES: Record<VehicleType, readonly string[]> = {
  car: ['Hatchback', 'Sedan', 'SUV', 'MUV'],
  bike: ['Scooter', 'Cruiser', 'Sports', 'Commuter', 'Standard'],
  ev: ['EV Car', 'EV Bike', 'EV Scooter'],
  truck: ['Mini Truck', 'Pickup', 'Heavy Truck', 'Container'],
  bus: ['Mini Bus', 'Coach', 'School Bus'],
  auto: [],
  other: [],
};

export function getVehicleSubtypes(type: VehicleType): string[] {
  return [...VEHICLE_SUBTYPES[type]];
}

export function hasVehicleSubtypes(type: VehicleType): boolean {
  return VEHICLE_SUBTYPES[type].length > 0;
}
