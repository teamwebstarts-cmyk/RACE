import { driverBookingService } from './bookings/driverBooking';
import type { CombinedBookingListItemDto, CombinedBookingListQuery } from './combinedBookingValidator';
import { towingBookingService } from './bookings/towingBooking';

function mapTowingItem(
  booking: Awaited<ReturnType<typeof towingBookingService.listBookings>>[number],
): CombinedBookingListItemDto {
  return {
    id: booking.id,
    bookingNumber: booking.bookingNumber,
    bookingType: 'towing',
    serviceLabel: 'Towing',
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    vehicleId: booking.vehicleId ?? '',
    pickup: booking.pickup,
    dropoff: booking.dropoff,
    distanceKm: booking.distanceKm,
    estimatedFare: booking.estimatedFare,
    fareBreakdown: booking.fareBreakdown,
    advanceAmount: booking.advanceAmount,
    advancePaid: booking.advancePaid,
    remainingAmount: booking.remainingAmount,
    remainingPaid: booking.remainingPaid,
    driverId: booking.driverId,
    driver: booking.driver,
    scheduledAt: booking.scheduledAt,
    statusHistory: booking.statusHistory,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  };
}

function mapDriverItem(
  booking: Awaited<ReturnType<typeof driverBookingService.listBookings>>[number],
): CombinedBookingListItemDto {
  return {
    id: booking.id,
    bookingNumber: booking.bookingNumber,
    bookingType: 'driver',
    serviceLabel: 'Driver Hire',
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    vehicleId: booking.vehicleId ?? '',
    pickup: booking.pickup,
    dropoff: booking.dropoff,
    packageHours: booking.packageHours,
    vehicleCategory: booking.vehicleCategory,
    includedKm: booking.includedKm,
    estimatedDurationHours: booking.estimatedDurationHours,
    estimatedFare: booking.estimatedFare,
    fareBreakdown: booking.fareBreakdown,
    advanceAmount: booking.advanceAmount,
    advancePaid: booking.advancePaid,
    remainingAmount: booking.remainingAmount,
    remainingPaid: booking.remainingPaid,
    driverId: booking.driverId,
    driver: booking.driver,
    scheduledAt: booking.scheduledAt,
    statusHistory: booking.statusHistory,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  };
}

export class CombinedBookingService {
  async listBookings(
    customerId: string,
    query: CombinedBookingListQuery = {},
  ): Promise<CombinedBookingListItemDto[]> {
    const status = query.status;
    const includeTowing = !query.type || query.type === 'towing';
    const includeDriver = !query.type || query.type === 'driver';

    const [towingBookings, driverBookings] = await Promise.all([
      includeTowing ? towingBookingService.listBookings(customerId, status) : Promise.resolve([]),
      includeDriver ? driverBookingService.listBookings(customerId, status) : Promise.resolve([]),
    ]);

    return [...towingBookings.map(mapTowingItem), ...driverBookings.map(mapDriverItem)].sort(
      (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );
  }
}

export const combinedBookingService = new CombinedBookingService();
