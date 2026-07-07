import { BadRequestError, ForbiddenError, NotFoundError } from '../../../shared/utils/errors';
import { emitBookingStatusUpdate } from '../../../shared/socket.service';
import { UserModel } from '../../users/user.model';
import { vehicleRepository } from '../../vehicles/vehicle.repository';
import { PaymentTransactionModel } from '../../payments/payment-transaction.model';
import {
  appendStatusHistory,
  assertValidStatusTransition,
  calculateDriverFare,
  createInitialStatusHistory,
  generatePrefixedBookingNumber,
  getVehicleCategory,
  resolvePackageHours,
} from '../shared/booking.helpers';
import { canTransition, type UnifiedBookingStatus } from '../shared/booking-status.constants';
import { driverBookingRepository } from './driver-booking.repository';
import type { IDriverBooking } from './driver-booking.model';
import type {
  CreateDriverBookingDto,
  DriverBookingResponseDto,
  DriverTrackingResponseDto,
} from './driver-booking.validator';
import type { SubmitServiceBookingRatingDto } from '../shared/booking-rating.validator';
import { buildServiceBookingRatingUpdate } from '../shared/booking-rating.helpers';
import { getCancellationPolicy, type CancellationResult } from '../shared/cancellation.helpers';
import { releaseDriver } from '../shared/driver-assignment.service';

function mapDriverBooking(booking: IDriverBooking): DriverBookingResponseDto {
  return {
    id: booking.id,
    bookingNumber: booking.bookingNumber,
    customerId: booking.customerId.toString(),
    vehicleId: booking.vehicleId?.toString(),
    pickup: booking.pickup,
    dropoff: booking.dropoff,
    estimatedDurationHours: booking.estimatedDurationHours,
    packageHours: booking.packageHours,
    vehicleCategory: booking.vehicleCategory,
    includedKm: booking.includedKm,
    estimatedFare: booking.estimatedFare,
    fareBreakdown: booking.fareBreakdown,
    advanceAmount: booking.advanceAmount,
    advancePaid: booking.advancePaid,
    advancePaymentId: booking.advancePaymentId,
    remainingAmount: booking.remainingAmount,
    remainingPaid: booking.remainingPaid,
    paymentStatus: booking.paymentStatus,
    status: booking.status,
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

export class DriverBookingService {
  async createBooking(
    customerId: string,
    dto: CreateDriverBookingDto,
  ): Promise<DriverBookingResponseDto> {
    const vehicle = await vehicleRepository.findByIdForCustomer(dto.vehicleId, customerId);
    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    const vehicleCategory = getVehicleCategory(vehicle.vehicleType, vehicle.vehicleSubtype);
    const packageHours = resolvePackageHours(dto.packageHours, dto.estimatedDurationHours);
    const { fare, breakdown } = calculateDriverFare(packageHours, vehicleCategory);
    const bookingNumber = await generatePrefixedBookingNumber('DRV', () =>
      driverBookingRepository.countAll(),
    );

    const booking = await driverBookingRepository.create({
      customerId: customerId as unknown as IDriverBooking['customerId'],
      bookingNumber,
      vehicleId: vehicle.id as unknown as IDriverBooking['vehicleId'],
      pickup: dto.pickup,
      dropoff: dto.dropoff,
      estimatedDurationHours: dto.estimatedDurationHours ?? packageHours,
      packageHours,
      vehicleCategory,
      includedKm: breakdown.includedKm,
      estimatedFare: fare,
      fareBreakdown: breakdown,
      advanceAmount: breakdown.advanceAmount,
      remainingAmount: breakdown.remainingAmount,
      paymentStatus: 'PENDING_ADVANCE',
      status: 'PENDING',
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      statusHistory: createInitialStatusHistory('PENDING'),
    });

    return mapDriverBooking(booking);
  }

  async listBookings(
    customerId: string,
    status?: UnifiedBookingStatus,
  ): Promise<DriverBookingResponseDto[]> {
    const bookings = await driverBookingRepository.findByCustomer(customerId, { status });
    return bookings.map(mapDriverBooking);
  }

  async getBookingById(
    bookingId: string,
    requestingUser: { id: string; role: string },
  ): Promise<DriverBookingResponseDto> {
    const booking = await driverBookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Driver booking not found');
    }

    if (booking.customerId.toString() !== requestingUser.id && requestingUser.role !== 'admin') {
      throw new ForbiddenError('You do not have access to this booking');
    }

    return mapDriverBooking(booking);
  }

  async updateStatus(
    bookingId: string,
    newStatus: UnifiedBookingStatus,
    actor: { id: string; role: string },
  ): Promise<DriverBookingResponseDto> {
    const booking = await driverBookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Driver booking not found');
    }

    if (booking.customerId.toString() !== actor.id && actor.role !== 'admin') {
      throw new ForbiddenError('You do not have access to this booking');
    }

    assertValidStatusTransition(booking.status, newStatus);

    const updated = await driverBookingRepository.updateStatus(
      bookingId,
      newStatus,
      appendStatusHistory(booking.statusHistory, newStatus),
    );

    if (!updated) {
      throw new NotFoundError('Driver booking not found');
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

    return mapDriverBooking(updated);
  }

  async getTracking(
    bookingId: string,
    requestingUser: { id: string; role: string },
  ): Promise<DriverTrackingResponseDto> {
    const booking = await driverBookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Driver booking not found');
    }

    if (booking.customerId.toString() !== requestingUser.id && requestingUser.role !== 'admin') {
      throw new ForbiddenError('You do not have access to this booking');
    }

    let driverLocation: DriverTrackingResponseDto['driverLocation'];
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
    const booking = await driverBookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Driver booking not found');
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
    booking: DriverBookingResponseDto;
    refundAmount: number;
    refundStatus: string;
    policy: CancellationResult;
  }> {
    const booking = await driverBookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Driver booking not found');
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
        bookingType: 'driver',
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

    const mapped = mapDriverBooking(booking);
    return {
      booking: mapped,
      refundAmount: policy.refundAmount,
      refundStatus: booking.refundStatus,
      policy,
    };
  }

  async applyPaymentUpdate(
    bookingId: string,
    update: Partial<IDriverBooking>,
  ): Promise<DriverBookingResponseDto> {
    const booking = await driverBookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Driver booking not found');
    }

    let statusHistory = booking.statusHistory;
    if (update.status && update.status !== booking.status) {
      statusHistory = appendStatusHistory(statusHistory, update.status);
    }

    const updated = await driverBookingRepository.updateById(bookingId, {
      ...update,
      statusHistory,
    });

    if (!updated) {
      throw new NotFoundError('Driver booking not found');
    }

    return mapDriverBooking(updated);
  }

  async submitRating(
    bookingId: string,
    requestingUser: { id: string; role: string },
    dto: SubmitServiceBookingRatingDto,
  ): Promise<DriverBookingResponseDto> {
    const booking = await driverBookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Driver booking not found');
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

    const updated = await driverBookingRepository.updateById(bookingId, update);
    if (!updated) {
      throw new NotFoundError('Driver booking not found');
    }

    return mapDriverBooking(updated);
  }
}

export const driverBookingService = new DriverBookingService();
