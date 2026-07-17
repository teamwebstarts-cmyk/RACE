import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../../utils/src/errors';
import { UserModel } from '../../models/src/user';
import { VendorVehicleModel } from '../../models/src/vendorVehicle';
import { TowingBookingModel } from '../../models/src/towingBooking';
import { DriverBookingModel } from '../../models/src/driverBooking';
import {
  claimOpenBookingOffer,
  isDriverEligibleForBooking,
  listOpenBookingOffers,
  type OpenBookingOffer,
} from './bookings/driverAssignment';
import { resolveAssignedDriver } from './bookings/assignedDriver';
import type { VendorAssignBookingDto, VendorVerifyTripOtpDto } from './vendorBookingsValidator';
import { assertTripStartOtp } from './bookings/tripOtp';
import { appendStatusHistory } from './bookings/booking';
import { emitBookingStatusUpdate } from './socket';

export class VendorBookingsService {
  private async assertVendorApproved(vendorUserId: string) {
    const user = await UserModel.findById(vendorUserId).exec();
    if (!user || user.role !== 'vendor') {
      throw new ForbiddenError('Vendor access only');
    }
    if (user.vendorProfile?.status !== 'approved') {
      throw new ForbiddenError(
        'Your vendor account must be approved before you can assign jobs.',
      );
    }
    return user;
  }

  async listOffers(vendorUserId: string): Promise<OpenBookingOffer[]> {
    await this.assertVendorApproved(vendorUserId);
    return listOpenBookingOffers();
  }

  /**
   * Vendor picks a fleet driver (+ optional fleet vehicle) for an open customer request.
   * Dispatches immediately so the customer sees partner details.
   */
  async assignBooking(
    vendorUserId: string,
    bookingId: string,
    dto: VendorAssignBookingDto,
  ) {
    await this.assertVendorApproved(vendorUserId);

    const driver = await UserModel.findOne({ _id: dto.driverId, role: 'driver' }).exec();
    if (!driver?.driverProfile) {
      throw new NotFoundError('Driver not found');
    }
    if (driver.driverProfile.vendorUserId?.toString() !== vendorUserId) {
      throw new ForbiddenError('Driver is not in your fleet');
    }
    if (!isDriverEligibleForBooking(driver, dto.bookingType)) {
      throw new BadRequestError(
        dto.bookingType === 'towing'
          ? 'Select a Tow Driver for towing requests'
          : 'Select a Full-Time or Part-Time driver for driver-hire requests',
      );
    }

    let fleetVehicleLabel: string | undefined;
    let fleetVehicleId: string | undefined;

    if (dto.vehicleId) {
      const vehicle = await VendorVehicleModel.findById(dto.vehicleId).exec();
      if (!vehicle) throw new NotFoundError('Fleet vehicle not found');
      if (vehicle.vendorId.toString() !== vendorUserId) {
        throw new ForbiddenError('Vehicle is not in your fleet');
      }
      if (vehicle.status !== 'ACTIVE') {
        throw new BadRequestError('Only ACTIVE fleet vehicles can be assigned');
      }
      fleetVehicleId = vehicle.id;
      fleetVehicleLabel = `${vehicle.registrationNo} · ${vehicle.type} · ${vehicle.vehicleModel}`;
    }

    const result = await claimOpenBookingOffer(bookingId, dto.bookingType, dto.driverId, {
      vendorId: vendorUserId,
      fleetVehicleId,
      fleetVehicleLabel,
    });

    const assignedDriver = await resolveAssignedDriver(dto.driverId);

    return {
      ...result,
      driver: assignedDriver,
      assignedFleetVehicleLabel: fleetVehicleLabel,
      message: 'Driver and vehicle assigned — customer can see partner details now',
    };
  }

  /**
   * Vendor verifies customer's trip OTP and starts the service (DRIVER_ARRIVED → IN_PROGRESS).
   */
  async verifyTripOtp(
    vendorUserId: string,
    bookingId: string,
    dto: VendorVerifyTripOtpDto,
  ) {
    await this.assertVendorApproved(vendorUserId);

    const booking =
      dto.bookingType === 'towing'
        ? await TowingBookingModel.findById(bookingId).exec()
        : await DriverBookingModel.findById(bookingId).exec();
    if (!booking) throw new NotFoundError('Booking not found');
    if (booking.vendorId?.toString() !== vendorUserId) {
      throw new ForbiddenError('This booking is not assigned to your fleet');
    }
    if (booking.status !== 'DRIVER_ARRIVED') {
      throw new BadRequestError('Mark driver as arrived before verifying trip OTP');
    }

    assertTripStartOtp(booking, dto.tripOtp);

    const updated =
      dto.bookingType === 'towing'
        ? await TowingBookingModel.findByIdAndUpdate(
            bookingId,
            {
              status: 'IN_PROGRESS',
              tripStartOtpVerified: true,
              statusHistory: appendStatusHistory(booking.statusHistory, 'IN_PROGRESS'),
            },
            { new: true },
          ).exec()
        : await DriverBookingModel.findByIdAndUpdate(
            bookingId,
            {
              status: 'IN_PROGRESS',
              tripStartOtpVerified: true,
              statusHistory: appendStatusHistory(booking.statusHistory, 'IN_PROGRESS'),
            },
            { new: true },
          ).exec();

    if (!updated) throw new NotFoundError('Booking not found');

    emitBookingStatusUpdate(bookingId, 'IN_PROGRESS', {
      message: 'Trip started — OTP verified',
    });

    const driver = await resolveAssignedDriver(updated.driverId?.toString());
    return {
      id: updated.id,
      status: updated.status,
      bookingNumber: updated.bookingNumber,
      driver,
      assignedFleetVehicleLabel:
        'assignedFleetVehicleLabel' in updated ? updated.assignedFleetVehicleLabel : undefined,
      message: 'Trip OTP verified — service started',
    };
  }

  async getAssignedSummary(bookingId: string, bookingType: 'towing' | 'driver') {
    const booking =
      bookingType === 'towing'
        ? await TowingBookingModel.findById(bookingId).exec()
        : await DriverBookingModel.findById(bookingId).exec();
    if (!booking) throw new NotFoundError('Booking not found');

    const driver = await resolveAssignedDriver(booking.driverId?.toString());
    return {
      id: booking.id,
      status: booking.status,
      bookingNumber: booking.bookingNumber,
      vendorId: 'vendorId' in booking ? booking.vendorId?.toString() : undefined,
      driver,
      assignedFleetVehicleLabel:
        'assignedFleetVehicleLabel' in booking
          ? booking.assignedFleetVehicleLabel
          : undefined,
    };
  }
}

export const vendorBookingsService = new VendorBookingsService();
