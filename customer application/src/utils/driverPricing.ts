import type { DriverPackageHours } from '../types/fare';
import type { DriverTypeId } from '../types/driverBooking';
import type { DriverVehicleCategory } from '../types/fare';
import { getPackagePrice } from '../constants/driverBooking';

export interface DriverPriceBreakdown {
  subtotal: number;
  totalPrice: number;
  advancePayment: number;
  includedKm: number;
}

export function formatRupee(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function calculateDriverPricing(
  packageHours: DriverPackageHours,
  vehicleCategory: DriverVehicleCategory = 'hatchback',
  _driverType: DriverTypeId = 'part_time',
): DriverPriceBreakdown {
  const packageFare = getPackagePrice(packageHours, vehicleCategory);
  const advancePayment = Math.round(packageFare * 0.3);
  const pkg = [2, 4, 8, 12, 24].includes(packageHours)
    ? { 2: 20, 4: 40, 8: 80, 12: 120, 24: 240 }[packageHours]
    : 20;

  return {
    subtotal: packageFare,
    totalPrice: packageFare,
    advancePayment,
    includedKm: pkg ?? 20,
  };
}
