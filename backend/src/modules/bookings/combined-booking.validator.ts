import { z } from 'zod';

import { UNIFIED_BOOKING_STATUSES } from './shared/booking-status.constants';
import type { DriverFareBreakdown, TowingFareBreakdown } from './shared/booking.helpers';

export const combinedBookingListQuerySchema = z.object({
  status: z.enum(UNIFIED_BOOKING_STATUSES).optional(),
  type: z.enum(['towing', 'driver']).optional(),
});

export type CombinedBookingListQuery = z.infer<typeof combinedBookingListQuerySchema>;

export interface CombinedBookingLocationDto {
  address: string;
  latitude: number;
  longitude: number;
}

export interface CombinedBookingListItemDto {
  id: string;
  bookingNumber: string;
  bookingType: 'towing' | 'driver';
  serviceLabel: string;
  status: string;
  paymentStatus: string;
  vehicleId: string;
  pickup: CombinedBookingLocationDto;
  dropoff?: CombinedBookingLocationDto;
  distanceKm?: number;
  packageHours?: number;
  vehicleCategory?: string;
  includedKm?: number;
  estimatedDurationHours?: number;
  estimatedFare: number;
  fareBreakdown?: TowingFareBreakdown | DriverFareBreakdown;
  advanceAmount: number;
  advancePaid: boolean;
  remainingAmount: number;
  remainingPaid: boolean;
  scheduledAt?: string;
  statusHistory: Array<{ status: string; timestamp: string }>;
  createdAt: string;
  updatedAt: string;
}
