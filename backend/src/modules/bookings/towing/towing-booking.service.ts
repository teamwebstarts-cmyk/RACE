import { BadRequestError, ForbiddenError, NotFoundError } from '../../../shared/utils/errors';
import { getDistanceAndDuration } from '../../../shared/google-maps.service';
import { emitBookingStatusUpdate } from '../../../shared/socket.service';
import { vehicleRepository } from '../../vehicles/vehicle.repository';
import { UserModel } from '../../users/user.model';
import { PaymentTransactionModel } from '../../payments/payment-transaction.model';
import {
  appendStatusHistory,
  assertValidStatusTransition,
  calculateTowingFare,
  createInitialStatusHistory,
  generatePrefixedBookingNumber,
} from '../shared/booking.helpers';
import { canTransition, type UnifiedBookingStatus } from '../shared/booking-status.constants';
import { towingBookingRepository } from './towing-booking.repository';
import type { ITowingBooking } from './towing-booking.model';
import type {
  CreateTowingBookingDto,
  TowingBookingResponseDto,
  TowingTrackingResponseDto,
} from './towing-booking.validator';
import type { SubmitServiceBookingRatingDto } from '../shared/booking-rating.validator';
import { buildServiceBookingRatingUpdate } from '../shared/booking-rating.helpers';
import { getCancellationPolicy, type CancellationResult } from '../shared/cancellation.helpers';
import { releaseDriver } from '../shared/driver-assignment.service';

function mapTowingBooking(booking: ITowingBooking): TowingBookingResponseDto {
  return {
    id: booking.id,
    bookingNumber: booking.bookingNumber,
    customerId: booking.customerId.toString(),
    vehicleId: booking.vehicleId.toString(),
    pickup: booking.pickup,
    dropoff: booking.dropoff,
    distanceKm: booking.distanceKm,
    estimatedFare: booking.estimatedFare,
    fareBreakdown: booking.fareBreakdown,
    advanceAmount: booking.advanceAmount,
    advancePaid: booking.advancePaid,
    advancePaymentId: booking.advancePaymentId,
    remainingAmount: booking.remainingAmount,
    remainingPaid: booking.remainingPaid,
    paymentStatus: booking.paymentStatus,
    status: booking.status,
    vendorId: booking.vendorId?.toString(),
    driverId: booking.driverId?.toString(),
    scheduledAt: booking.scheduledAt?.toISOString(),
    statusHistory: booking.statusHistory.map((entry) => ({
      status: entry.status,
      timestamp: entry.timestamp.toISOString(),
      note: entry.note,
    })),
    cancelledAt: booking.cancelledAt?.toISOString(),
    cancelledBy: booking.cancelledBy,
    cancellationReason: booking.cancellationReason,
    refundAmount: booking.refundAmount,
    refundStatus: booking.refundStatus,
    rating: booking.rating
      ? {
          score: booking.rating.score,
          review: booking.rating.review,
          tags: booking.rating.tags,
          createdAt: booking.rating.createdAt.toISOString(),
        }
      : undefined,
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
  };
}

export class TowingBookingService {
  async createBooking(
    customerId: string,
    dto: CreateTowingBookingDto,
  ): Promise<TowingBookingResponseDto> {
    const vehicle = await vehicleRepository.findByIdForCustomer(dto.vehicleId, customerId);
    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    const scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : undefined;
    const matrix = await getDistanceAndDuration(dto.pickup, dto.dropoff);
    const distanceKm = matrix?.distanceKm;
    const fareResult = calculateTowingFare(matrix?.distanceKm ?? 0, scheduledAt);
    const { fare, breakdown } = fareResult;
    const bookingNumber = await generatePrefixedBookingNumber('TOW', () =>
      towingBookingRepository.countAll(),
    );

    const booking = await towingBookingRepository.create({
      customerId: customerId as unknown as ITowingBooking['customerId'],
      bookingNumber,
      vehicleId: vehicle.id as unknown as ITowingBooking['vehicleId'],
      pickup: dto.pickup,
      dropoff: dto.dropoff,
      distanceKm,
      estimatedFare: fare,
      fareBreakdown: breakdown,
      advanceAmount: breakdown.advanceAmount,
      remainingAmount: breakdown.remainingAmount,
      paymentStatus: 'PENDING_ADVANCE',
      status: 'PENDING',
      scheduledAt,
      statusHistory: createInitialStatusHistory('PENDING'),
    });

    return mapTowingBooking(booking);
  }

  async listBookings(
    customerId: string,
    status?: UnifiedBookingStatus,
  ): Promise<TowingBookingResponseDto[]> {
    const bookings = await towingBookingRepository.findByCustomer(customerId, { status });
    return bookings.map(mapTowingBooking);
  }

  async getBookingById(
    bookingId: string,
    requestingUser: { id: string; role: string },
  ): Promise<TowingBookingResponseDto> {
    const booking = await towingBookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Towing booking not found');
    }

    if (booking.customerId.toString() !== requestingUser.id && requestingUser.role !== 'admin') {
      throw new ForbiddenError('You do not have access to this booking');
    }

    return mapTowingBooking(booking);
  }

  async updateStatus(
    bookingId: string,
    newStatus: UnifiedBookingStatus,
    actor: { id: string; role: string },
  ): Promise<TowingBookingResponseDto> {
    const booking = await towingBookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Towing booking not found');
    }

    if (booking.customerId.toString() !== actor.id && actor.role !== 'admin') {
      throw new ForbiddenError('You do not have access to this booking');
    }

    assertValidStatusTransition(booking.status, newStatus);

    const updated = await towingBookingRepository.updateStatus(
      bookingId,
      newStatus,
      appendStatusHistory(booking.statusHistory, newStatus),
    );

    if (!updated) {
      throw new NotFoundError('Towing booking not found');
    }

    if (
      (newStatus === 'COMPLETED' || newStatus === 'CANCELLED') &&
      booking.driverId
    ) {
      await releaseDriver(booking.driverId.toString());
    }

    emitBookingStatusUpdate(bookingId, newStatus, {
      statusHistory: updated.statusHistory.map((entry) => ({
        status: entry.status,
        timestamp: entry.timestamp.toISOString(),
      })),
    });

    return mapTowingBooking(updated);
  }

  async getTracking(
    bookingId: string,
    requestingUser: { id: string; role: string },
  ): Promise<TowingTrackingResponseDto> {
    const booking = await towingBookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Towing booking not found');
    }

    if (booking.customerId.toString() !== requestingUser.id && requestingUser.role !== 'admin') {
      throw new ForbiddenError('You do not have access to this booking');
    }

    let driverLocation: TowingTrackingResponseDto['driverLocation'];
    if (booking.driverId) {
      const driver = await UserModel.findById(booking.driverId)
        .select('currentLocation fullName mobileNumber')
        .exec();
      if (
        driver?.currentLocation?.latitude !== undefined &&
        driver.currentLocation.longitude !== undefined
      ) {
        driverLocation = {
          latitude: driver.currentLocation.latitude,
          longitude: driver.currentLocation.longitude,
          updatedAt: driver.currentLocation.updatedAt?.toISOString(),
          driverName: driver.fullName,
          driverPhone: driver.mobileNumber,
        };
      }
    }

    return {
      bookingId: booking.id,
      status: booking.status,
      statusHistory: booking.statusHistory.map((entry) => ({
        status: entry.status,
        timestamp: entry.timestamp.toISOString(),
      })),
      driverLocation,
      pickup: booking.pickup,
      dropoff: booking.dropoff,
    };
  }

  async getCancellationPreview(
    bookingId: string,
    customerId: string,
  ): Promise<CancellationResult> {
    const booking = await towingBookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Towing booking not found');
    }
    if (booking.customerId.toString() !== customerId) {
      throw new ForbiddenError('You do not have access to this booking');
    }
    return getCancellationPolicy(
      booking.status,
      booking.advancePaid,
      booking.advanceAmount,
      booking.scheduledAt,
    );
  }

  async cancelBooking(
    bookingId: string,
    customerId: string,
    reason?: string,
  ): Promise<{
    booking: TowingBookingResponseDto;
    refundAmount: number;
    refundStatus: string;
    policy: CancellationResult;
  }> {
    const booking = await towingBookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Towing booking not found');
    }

    if (booking.customerId.toString() !== customerId) {
      throw new ForbiddenError('You do not have access to this booking');
    }

    if (!canTransition(booking.status, 'CANCELLED')) {
      throw new BadRequestError('Cannot cancel at this stage');
    }

    const policy = getCancellationPolicy(
      booking.status,
      booking.advancePaid,
      booking.advanceAmount,
      booking.scheduledAt,
    );

    if (!policy.canCancel) {
      throw new BadRequestError(policy.reason);
    }

    booking.status = 'CANCELLED';
    booking.cancelledAt = new Date();
    booking.cancelledBy = 'customer';
    booking.cancellationReason = reason?.trim() || 'Customer requested';
    booking.refundAmount = policy.refundAmount;
    booking.refundStatus = policy.refundAmount > 0 ? 'PENDING' : 'NOT_APPLICABLE';
    booking.statusHistory.push({
      status: 'CANCELLED',
      timestamp: new Date(),
      note: policy.reason,
    });
    await booking.save();

    if (booking.driverId) {
      await releaseDriver(booking.driverId.toString());
    }

    if (policy.refundAmount > 0) {
      await PaymentTransactionModel.create({
        bookingId: booking._id,
        bookingType: 'towing',
        customerId: booking.customerId,
        paymentType: 'refund',
        amount: policy.refundAmount,
        status: 'initiated',
        note: 'Stub refund - Razorpay integration pending',
      });
      // TODO: Trigger actual Razorpay refund when payment gateway is integrated
    }

    emitBookingStatusUpdate(booking.id, 'CANCELLED', {
      statusHistory: booking.statusHistory.map((entry) => ({
        status: entry.status,
        timestamp: entry.timestamp.toISOString(),
        note: entry.note,
      })),
    });

    const mapped = mapTowingBooking(booking);
    return {
      booking: mapped,
      refundAmount: policy.refundAmount,
      refundStatus: booking.refundStatus,
      policy,
    };
  }

  /** Used by payment module to apply advance/final payment updates. */
  async applyPaymentUpdate(
    bookingId: string,
    update: Partial<ITowingBooking>,
  ): Promise<TowingBookingResponseDto> {
    const booking = await towingBookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Towing booking not found');
    }

    let statusHistory = booking.statusHistory;
    if (update.status && update.status !== booking.status) {
      statusHistory = appendStatusHistory(statusHistory, update.status);
    }

    const updated = await towingBookingRepository.updateById(bookingId, {
      ...update,
      statusHistory,
    });

    if (!updated) {
      throw new NotFoundError('Towing booking not found');
    }

    return mapTowingBooking(updated);
  }

  async submitRating(
    bookingId: string,
    requestingUser: { id: string; role: string },
    dto: SubmitServiceBookingRatingDto,
  ): Promise<TowingBookingResponseDto> {
    const booking = await towingBookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Towing booking not found');
    }

    if (booking.customerId.toString() !== requestingUser.id && requestingUser.role !== 'admin') {
      throw new ForbiddenError('You do not have access to this booking');
    }

    const update = buildServiceBookingRatingUpdate(
      booking.status,
      booking.statusHistory,
      dto,
      Boolean(booking.rating),
    );

    const updated = await towingBookingRepository.updateById(bookingId, update);
    if (!updated) {
      throw new NotFoundError('Towing booking not found');
    }

    return mapTowingBooking(updated);
  }
}

export const towingBookingService = new TowingBookingService();
