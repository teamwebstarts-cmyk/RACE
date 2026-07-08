import { BadRequestError, ForbiddenError, NotFoundError } from '../../shared/utils/errors';
import { emitBookingStatusUpdate } from '../../shared/socket.service';
import { userRepository } from '../users/user.repository';
import { towingBookingRepository } from '../bookings/towing/towing-booking.repository';
import { driverBookingRepository } from '../bookings/driver/driver-booking.repository';
import {
  appendStatusHistory,
  assertValidStatusTransition,
} from '../bookings/shared/booking.helpers';
import { releaseDriver, unassignDriverFromBooking } from '../bookings/shared/driver-assignment.service';
import type { UnifiedBookingStatus } from '../bookings/shared/booking-status.constants';
import type {
  DriverBookingsQueryDto,
  UpdateDriverAvailabilityDto,
  UpdateDriverLocationDto,
  UpdateDriverBookingStatusDto,
} from './driver.validator';

const DRIVER_PROGRESS_STATUSES: UnifiedBookingStatus[] = [
  'DRIVER_ASSIGNED',
  'DRIVER_EN_ROUTE',
  'DRIVER_ARRIVED',
  'IN_PROGRESS',
  'COMPLETED',
];

function assertDriverRole(role: string): void {
  if (role !== 'driver') {
    throw new ForbiddenError('Driver access only');
  }
}

async function assertDriverApproved(driverId: string): Promise<void> {
  const driver = await userRepository.findById(driverId);
  if (!driver?.driverProfile) {
    throw new NotFoundError('Driver not found');
  }
  if (driver.driverProfile.status !== 'APPROVED') {
    throw new ForbiddenError('Driver account pending admin approval');
  }
}

export class DriverService {
  async updateAvailability(
    driverId: string,
    role: string,
    dto: UpdateDriverAvailabilityDto,
  ): Promise<{ isAvailable: boolean; message: string }> {
    assertDriverRole(role);

    const driver = await userRepository.findById(driverId);
    if (!driver) {
      throw new NotFoundError('Driver not found');
    }

    if (!dto.isAvailable && driver.activeBookingId) {
      throw new BadRequestError('Cannot go offline with active booking');
    }

    await userRepository.updateById(driverId, { isAvailable: dto.isAvailable });

    return {
      isAvailable: dto.isAvailable,
      message: dto.isAvailable ? 'You are now available' : 'You are now offline',
    };
  }

  async updateLocation(
    driverId: string,
    role: string,
    dto: UpdateDriverLocationDto,
  ): Promise<{ location: { latitude: number; longitude: number }; updatedAt: string }> {
    assertDriverRole(role);

    const updatedAt = new Date();
    // TODO: Replace with WebSocket when live tracking is implemented (Sprint 5)
    await userRepository.updateById(driverId, {
      currentLocation: {
        latitude: dto.latitude,
        longitude: dto.longitude,
        updatedAt,
      },
    });

    return {
      location: { latitude: dto.latitude, longitude: dto.longitude },
      updatedAt: updatedAt.toISOString(),
    };
  }

  async listBookings(driverId: string, role: string, query: DriverBookingsQueryDto) {
    assertDriverRole(role);
    await assertDriverApproved(driverId);

    const status = query.status;
    const includeTowing = !query.type || query.type === 'towing';
    const includeDriver = !query.type || query.type === 'driver';

    const [towingBookings, driverBookings] = await Promise.all([
      includeTowing ? towingBookingRepository.findByDriver(driverId, { status }) : Promise.resolve([]),
      includeDriver ? driverBookingRepository.findByDriver(driverId, { status }) : Promise.resolve([]),
    ]);

    const combined = [
      ...towingBookings.map((booking) => ({
        bookingType: 'towing' as const,
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        status: booking.status,
        pickup: booking.pickup,
        dropoff: booking.dropoff,
        estimatedFare: booking.estimatedFare,
        createdAt: booking.createdAt.toISOString(),
      })),
      ...driverBookings.map((booking) => ({
        bookingType: 'driver' as const,
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        status: booking.status,
        pickup: booking.pickup,
        dropoff: booking.dropoff,
        estimatedFare: booking.estimatedFare,
        createdAt: booking.createdAt.toISOString(),
      })),
    ];

    combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return combined;
  }

  async getActiveBooking(driverId: string, role: string) {
    assertDriverRole(role);
    await assertDriverApproved(driverId);

    const driver = await userRepository.findById(driverId);
    if (!driver) {
      throw new NotFoundError('Driver not found');
    }

    if (!driver.activeBookingId || !driver.activeBookingType) {
      return { active: false as const };
    }

    const bookingType = driver.activeBookingType;
    const bookingId = driver.activeBookingId.toString();

    const mapBooking = (
      type: 'towing' | 'driver',
      booking: {
        id?: string;
        bookingNumber: string;
        status: string;
        pickup?: unknown;
        dropoff?: unknown | null;
        estimatedFare?: number;
        createdAt: Date;
      },
    ) => ({
      bookingType: type,
      id: booking.id ?? bookingId,
      bookingNumber: booking.bookingNumber,
      status: booking.status,
      pickup: booking.pickup,
      dropoff: booking.dropoff,
      estimatedFare: booking.estimatedFare,
      createdAt: booking.createdAt.toISOString(),
    });

    if (bookingType === 'towing') {
      const booking = await towingBookingRepository.findById(bookingId);
      if (!booking) {
        return { active: false as const };
      }
      return { active: true as const, booking: mapBooking('towing', booking) };
    }

    const booking = await driverBookingRepository.findById(bookingId);
    if (!booking) {
      return { active: false as const };
    }
    return { active: true as const, booking: mapBooking('driver', booking) };
  }

  async updateBookingStatus(
    driverId: string,
    role: string,
    bookingId: string,
    dto: UpdateDriverBookingStatusDto,
  ) {
    assertDriverRole(role);
    await assertDriverApproved(driverId);

    if (!DRIVER_PROGRESS_STATUSES.includes(dto.status)) {
      throw new BadRequestError('Status not allowed for driver updates');
    }

    const Model =
      dto.bookingType === 'towing'
        ? towingBookingRepository
        : driverBookingRepository;

    const booking = await Model.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (!booking.driverId || booking.driverId.toString() !== driverId) {
      throw new ForbiddenError('This booking is not assigned to you');
    }

    assertValidStatusTransition(booking.status, dto.status);

    const updated = await Model.updateStatus(
      bookingId,
      dto.status,
      appendStatusHistory(booking.statusHistory, dto.status),
    );

    if (!updated) {
      throw new NotFoundError('Booking not found');
    }

    if (dto.status === 'COMPLETED') {
      await releaseDriver(driverId);
    }

    emitBookingStatusUpdate(bookingId, dto.status, {
      driverAccepted: dto.status === 'DRIVER_EN_ROUTE',
      statusHistory: updated.statusHistory.map((entry) => ({
        status: entry.status,
        timestamp: entry.timestamp.toISOString(),
      })),
    });

    return updated;
  }

  /** Accept allotted job: DRIVER_ASSIGNED → DRIVER_EN_ROUTE (customer tracking updates). */
  async acceptBooking(driverId: string, role: string, bookingId: string, bookingType: 'towing' | 'driver') {
    return this.updateBookingStatus(driverId, role, bookingId, {
      status: 'DRIVER_EN_ROUTE',
      bookingType,
    });
  }

  /** Reject allotted job: free driver and return booking to CONFIRMED for reassignment. */
  async rejectBooking(driverId: string, role: string, bookingId: string, bookingType: 'towing' | 'driver') {
    assertDriverRole(role);
    await assertDriverApproved(driverId);

    const Model = bookingType === 'towing' ? towingBookingRepository : driverBookingRepository;
    const booking = await Model.findById(bookingId);
    if (!booking) throw new NotFoundError('Booking not found');
    if (!booking.driverId || booking.driverId.toString() !== driverId) {
      throw new ForbiddenError('This booking is not assigned to you');
    }
    if (booking.status !== 'DRIVER_ASSIGNED') {
      throw new BadRequestError('Only newly assigned jobs can be rejected');
    }

    await unassignDriverFromBooking(bookingId, bookingType, driverId);
    emitBookingStatusUpdate(bookingId, 'CONFIRMED', {
      reason: 'Driver rejected assignment',
    });

    return { rejected: true, bookingId, status: 'CONFIRMED' as const };
  }
}

export const driverService = new DriverService();
