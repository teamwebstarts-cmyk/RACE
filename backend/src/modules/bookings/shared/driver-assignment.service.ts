import { Types } from 'mongoose';

import { logger } from '../../../shared/utils/logger';
import { BadRequestError, NotFoundError } from '../../../shared/utils/errors';
import { UserModel, type IUser } from '../../users/user.model';
import { TowingBookingModel } from '../towing/towing-booking.model';
import { DriverBookingModel } from '../driver/driver-booking.model';
import { canTransition } from './booking-status.constants';
import { appendStatusHistory } from './booking.helpers';
import type { ActiveBookingType } from '../../users/user.model';

const FALLBACK_DISTANCE_KM = 999;
const EARTH_RADIUS_KM = 6371;

/** Drivers eligible for towing / roadside tow bookings */
export const TOWING_DRIVER_TYPES = ['Tow Driver'] as const;

/** Drivers eligible for hire-a-driver (any package duration) */
export const DRIVER_SERVICE_TYPES = ['Full-Time', 'Part-Time'] as const;

function driverTypesForBooking(bookingType: ActiveBookingType): readonly string[] {
  return bookingType === 'towing' ? TOWING_DRIVER_TYPES : DRIVER_SERVICE_TYPES;
}

export function isDriverEligibleForBooking(
  driver: IUser,
  bookingType: ActiveBookingType,
): boolean {
  const driverType = driver.driverProfile?.driverType;
  if (!driverType) return false;
  return driverTypesForBooking(bookingType).includes(driverType);
}

function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);
  const rLat1 = toRad(lat1);
  const rLat2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(rLat1) * Math.cos(rLat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(c * EARTH_RADIUS_KM * 10) / 10;
}

function driverDistanceFromPickup(
  driver: IUser,
  pickupLatitude: number,
  pickupLongitude: number,
): number {
  const lat = driver.currentLocation?.latitude;
  const lng = driver.currentLocation?.longitude;
  if (lat !== undefined && lng !== undefined) {
    return haversineDistanceKm(pickupLatitude, pickupLongitude, lat, lng);
  }
  return FALLBACK_DISTANCE_KM;
}

// TODO: Replace with MongoDB $geoNear when driver app sends live location consistently
export async function findNearestAvailableDriver(
  pickupLatitude: number,
  pickupLongitude: number,
  bookingType: ActiveBookingType,
): Promise<{ driverId: string; distanceKm: number } | null> {
  const drivers = await UserModel.find({
    role: 'driver',
    isAvailable: true,
    'driverProfile.status': 'APPROVED',
    'driverProfile.driverType': { $in: [...driverTypesForBooking(bookingType)] },
    $or: [{ activeBookingId: null }, { activeBookingId: { $exists: false } }],
  }).exec();

  if (drivers.length === 0) {
    return null;
  }

  const ranked = drivers
    .map((driver) => ({
      driverId: driver.id,
      distanceKm: driverDistanceFromPickup(driver, pickupLatitude, pickupLongitude),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return ranked[0];
}

export async function assignDriverToBooking(
  bookingId: string,
  bookingType: ActiveBookingType,
  driverId: string,
): Promise<void> {
  const driver = await UserModel.findOne({ _id: driverId, role: 'driver' }).exec();
  if (!driver) {
    throw new NotFoundError('Driver not found');
  }

  if (!isDriverEligibleForBooking(driver, bookingType)) {
    const expected =
      bookingType === 'towing' ? 'tow driver' : 'driver service (Full-Time / Part-Time)';
    throw new BadRequestError(
      `Driver ${driver.fullName ?? driverId} is not eligible for ${bookingType} bookings (${expected} required)`,
    );
  }

  const driverObjectId = new Types.ObjectId(driverId);

  if (bookingType === 'towing') {
    const booking = await TowingBookingModel.findById(bookingId).exec();
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (!canTransition(booking.status, 'DRIVER_ASSIGNED')) {
      throw new BadRequestError(
        `Cannot assign driver: invalid status transition from ${booking.status} to DRIVER_ASSIGNED`,
      );
    }

    await TowingBookingModel.findByIdAndUpdate(bookingId, {
      driverId: driverObjectId,
      status: 'DRIVER_ASSIGNED',
      statusHistory: appendStatusHistory(booking.statusHistory, 'DRIVER_ASSIGNED'),
    }).exec();
  } else {
    const booking = await DriverBookingModel.findById(bookingId).exec();
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (!canTransition(booking.status, 'DRIVER_ASSIGNED')) {
      throw new BadRequestError(
        `Cannot assign driver: invalid status transition from ${booking.status} to DRIVER_ASSIGNED`,
      );
    }

    await DriverBookingModel.findByIdAndUpdate(bookingId, {
      driverId: driverObjectId,
      status: 'DRIVER_ASSIGNED',
      statusHistory: appendStatusHistory(booking.statusHistory, 'DRIVER_ASSIGNED'),
    }).exec();
  }

  await UserModel.findByIdAndUpdate(driverId, {
    isAvailable: false,
    activeBookingId: new Types.ObjectId(bookingId),
    activeBookingType: bookingType,
  }).exec();
}

export async function releaseDriver(driverId: string): Promise<void> {
  await UserModel.findByIdAndUpdate(driverId, {
    isAvailable: true,
    activeBookingId: null,
    activeBookingType: null,
  }).exec();
}

/** Driver rejects an assigned job — frees driver and returns booking to CONFIRMED for reassignment. */
export async function unassignDriverFromBooking(
  bookingId: string,
  bookingType: ActiveBookingType,
  driverId: string,
): Promise<void> {
  if (bookingType === 'towing') {
    const booking = await TowingBookingModel.findById(bookingId).exec();
    if (!booking) throw new NotFoundError('Booking not found');
    if (!booking.driverId || booking.driverId.toString() !== driverId) {
      throw new BadRequestError('Booking is not assigned to this driver');
    }
    await TowingBookingModel.findByIdAndUpdate(bookingId, {
      $unset: { driverId: 1 },
      status: 'CONFIRMED',
      statusHistory: appendStatusHistory(booking.statusHistory, 'CONFIRMED'),
    }).exec();
  } else {
    const booking = await DriverBookingModel.findById(bookingId).exec();
    if (!booking) throw new NotFoundError('Booking not found');
    if (!booking.driverId || booking.driverId.toString() !== driverId) {
      throw new BadRequestError('Booking is not assigned to this driver');
    }
    await DriverBookingModel.findByIdAndUpdate(bookingId, {
      $unset: { driverId: 1 },
      status: 'CONFIRMED',
      statusHistory: appendStatusHistory(booking.statusHistory, 'CONFIRMED'),
    }).exec();
  }

  await releaseDriver(driverId);
}

export async function autoAssignDriver(
  bookingId: string,
  bookingType: ActiveBookingType,
  pickupLatitude: number,
  pickupLongitude: number,
): Promise<{ assigned: boolean; driverId?: string; reason?: string }> {
  try {
    const nearest = await findNearestAvailableDriver(
      pickupLatitude,
      pickupLongitude,
      bookingType,
    );
    if (!nearest) {
      logger.warn(`No available drivers for ${bookingType} booking ${bookingId}`);
      return { assigned: false, reason: 'No drivers available' };
    }

    await assignDriverToBooking(bookingId, bookingType, nearest.driverId);
    return { assigned: true, driverId: nearest.driverId };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Driver assignment failed';
    logger.error(`Driver auto-assign failed for ${bookingType} booking ${bookingId}`, {
      error: message,
    });
    return { assigned: false, reason: message };
  }
}

export interface AvailableDriverSummary {
  _id: string;
  fullName?: string;
  mobileNumber: string;
  isAvailable?: boolean;
  currentLocation?: IUser['currentLocation'];
  activeBookingId?: string | null;
  distanceKm?: number;
}

export async function listAvailableDrivers(options?: {
  latitude?: number;
  longitude?: number;
  bookingType?: ActiveBookingType;
}): Promise<AvailableDriverSummary[]> {
  const filter: Record<string, unknown> = {
    role: 'driver',
    isAvailable: true,
    'driverProfile.status': 'APPROVED',
  };

  if (options?.bookingType) {
    filter['driverProfile.driverType'] = { $in: [...driverTypesForBooking(options.bookingType)] };
  }

  const drivers = await UserModel.find(filter).exec();

  const summaries = drivers.map((driver) => {
    const summary: AvailableDriverSummary = {
      _id: driver.id,
      fullName: driver.fullName,
      mobileNumber: driver.mobileNumber,
      isAvailable: driver.isAvailable,
      currentLocation: driver.currentLocation,
      activeBookingId: driver.activeBookingId?.toString() ?? null,
    };

    if (
      options?.latitude !== undefined &&
      options?.longitude !== undefined
    ) {
      summary.distanceKm = driverDistanceFromPickup(
        driver,
        options.latitude,
        options.longitude,
      );
    }

    return summary;
  });

  if (options?.latitude !== undefined && options?.longitude !== undefined) {
    summaries.sort((a, b) => (a.distanceKm ?? FALLBACK_DISTANCE_KM) - (b.distanceKm ?? FALLBACK_DISTANCE_KM));
  }

  return summaries;
}
