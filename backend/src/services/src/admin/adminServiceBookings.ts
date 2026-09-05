import { BadRequestError, NotFoundError } from '../../../utils/src/errors';
import { emitBookingStatusUpdate } from '../socket';
import { userRepository } from '../userRepository';
import { towingBookingRepository } from '../towingBookingRepository';
import { driverBookingRepository } from '../driverBookingRepository';
import { assignDriverToBooking } from '../bookings/driverAssignment';
import { releaseDriver } from '../bookings/driverAssignment';
import { PaymentTransactionModel } from '../../../models/src/paymentTransaction';
import type {
  AssignServiceBookingDriverDto,
  CancelServiceBookingDto,
} from './adminServiceBookingsValidator';

export class AdminServiceBookingsService {
  async assignDriver(bookingId: string, dto: AssignServiceBookingDriverDto) {
    const driver = await userRepository.findById(dto.driverId);
    if (!driver || driver.role !== 'driver') {
      throw new NotFoundError('Driver not found');
    }

    if (!driver.isAvailable) {
      throw new BadRequestError('Driver is not available');
    }

    if (driver.activeBookingId) {
      throw new BadRequestError('Driver already has an active booking');
    }

    await assignDriverToBooking(bookingId, dto.bookingType, dto.driverId);

    const booking =
      dto.bookingType === 'towing'
        ? await towingBookingRepository.findById(bookingId)
        : await driverBookingRepository.findById(bookingId);

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    return {
      message: 'Driver assigned successfully',
      booking,
      driver: {
        name: driver.fullName,
        phone: driver.mobileNumber,
        currentLocation: driver.currentLocation,
      },
    };
  }

  async cancelBooking(bookingId: string, dto: CancelServiceBookingDto) {
    const booking =
      dto.bookingType === 'towing'
        ? await towingBookingRepository.findById(bookingId)
        : await driverBookingRepository.findById(bookingId);

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    const calculatedFullRefund = booking.advancePaid ? booking.advanceAmount : 0;
    const refundAmount = dto.refundAmount ?? calculatedFullRefund;
    if (refundAmount < 0) {
      throw new BadRequestError('refundAmount must be positive');
    }

    booking.status = 'CANCELLED';
    booking.cancelledAt = new Date();
    booking.cancelledBy = 'admin';
    booking.cancellationReason = dto.reason;
    booking.refundAmount = refundAmount;
    booking.refundStatus = refundAmount > 0 ? 'PENDING' : 'NOT_APPLICABLE';
    booking.statusHistory.push({
      status: 'CANCELLED',
      timestamp: new Date(),
      note: `Admin cancelled: ${dto.reason}`,
    });
    await booking.save();

    if (booking.driverId) {
      await releaseDriver(booking.driverId.toString());
    }

    if (refundAmount > 0) {
      await PaymentTransactionModel.create({
        bookingId: booking._id,
        bookingType: dto.bookingType,
        customerId: booking.customerId,
        paymentType: 'refund',
        amount: refundAmount,
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

    return {
      message: 'Booking cancelled by admin',
      booking,
      refundAmount,
      refundStatus: booking.refundStatus,
    };
  }
}

export const adminServiceBookingsService = new AdminServiceBookingsService();
