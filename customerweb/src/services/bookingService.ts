import { API_ENDPOINTS } from '../config/api';
import type { Booking } from '../types/models';
import { api, unwrapApi } from './api';

export type ServiceBookingType = 'towing' | 'driver';

export interface BookingLocationInput {
  address: string;
  latitude: number;
  longitude: number;
}

export interface CreateTowingBookingRequest {
  vehicleId: string;
  pickup: BookingLocationInput;
  dropoff: BookingLocationInput;
  scheduledAt?: string;
}

export interface CreateDriverBookingRequest {
  vehicleId: string;
  pickup: BookingLocationInput;
  dropoff?: BookingLocationInput;
  packageHours?: 2 | 4 | 8 | 12 | 24;
  scheduledAt?: string;
}

export interface PaymentSession {
  transactionId: string;
  bookingId: string;
  bookingType: string;
  paymentType: 'advance' | 'final';
  amount: number;
  status: string;
  gatewayReferenceId: string;
  message: string;
}

interface CombinedBookingItem {
  id: string;
  bookingNumber: string;
  bookingType: 'towing' | 'driver' | 'roadside';
  serviceLabel: string;
  status: string;
  vehicleId?: string;
  pickup?: { address: string; latitude?: number; longitude?: number };
  dropoff?: { address: string; latitude?: number; longitude?: number };
  scheduledAt?: string;
  createdAt: string;
  updatedAt?: string;
  estimatedFare?: number;
  advancePaid?: boolean;
  paymentStatus?: string;
  driverId?: string;
  driver?: { id: string; name: string; rating?: number; phone?: string } | null;
}

function mapDriver(
  item: CombinedBookingItem,
): Booking['driver'] | undefined {
  if (item.driver && item.driver.id) {
    return {
      id: item.driver.id,
      name: item.driver.name,
      rating: item.driver.rating,
      phone: item.driver.phone,
    };
  }
  return undefined;
}

function mapBooking(item: CombinedBookingItem): Booking {
  return {
    id: item.id,
    bookingNumber: item.bookingNumber,
    bookingType: item.bookingType,
    serviceLabel: item.serviceLabel || item.bookingType,
    status: item.status,
    vehicleId: item.vehicleId,
    pickup: item.pickup,
    dropoff: item.dropoff,
    scheduledAt: item.scheduledAt,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    estimatedFare: item.estimatedFare,
    advancePaid: item.advancePaid,
    paymentStatus: item.paymentStatus,
    driver: mapDriver(item),
  };
}

export async function listBookings(): Promise<Booking[]> {
  const items = await unwrapApi<CombinedBookingItem[]>(api.get(API_ENDPOINTS.bookings));
  return items.map(mapBooking);
}

export async function getBooking(id: string): Promise<Booking> {
  try {
    const towing = await unwrapApi<CombinedBookingItem>(
      api.get(API_ENDPOINTS.towingBooking(id)),
    );
    return mapBooking({
      ...towing,
      bookingType: 'towing',
      serviceLabel: towing.serviceLabel || 'Towing',
    });
  } catch {
    const driver = await unwrapApi<CombinedBookingItem>(
      api.get(API_ENDPOINTS.driverBooking(id)),
    );
    return mapBooking({
      ...driver,
      bookingType: 'driver',
      serviceLabel: driver.serviceLabel || 'Driver Hire',
    });
  }
}

export async function createTowingBooking(
  payload: CreateTowingBookingRequest,
): Promise<Booking> {
  const created = await unwrapApi<CombinedBookingItem>(
    api.post(API_ENDPOINTS.towingBookings, payload),
  );
  return mapBooking({
    ...created,
    bookingType: 'towing',
    serviceLabel: created.serviceLabel || 'Towing',
  });
}

export async function createDriverBooking(
  payload: CreateDriverBookingRequest,
): Promise<Booking> {
  const created = await unwrapApi<CombinedBookingItem>(
    api.post(API_ENDPOINTS.driverBookings, payload),
  );
  return mapBooking({
    ...created,
    bookingType: 'driver',
    serviceLabel: created.serviceLabel || 'Driver Hire',
  });
}

export async function initiateAdvancePayment(payload: {
  bookingId: string;
  bookingType: ServiceBookingType;
}): Promise<PaymentSession> {
  return unwrapApi<PaymentSession>(api.post(API_ENDPOINTS.paymentAdvance, payload));
}

export async function verifyAdvancePayment(payload: {
  transactionId: string;
  status: 'success' | 'failed';
}): Promise<PaymentSession> {
  return unwrapApi<PaymentSession>(
    api.post(API_ENDPOINTS.paymentAdvanceVerify, payload),
  );
}

/** Stub gateway flow: initiate advance payment then verify success. */
export async function completeAdvancePayment(
  bookingId: string,
  bookingType: ServiceBookingType,
): Promise<PaymentSession> {
  const session = await initiateAdvancePayment({ bookingId, bookingType });
  return verifyAdvancePayment({
    transactionId: session.transactionId,
    status: 'success',
  });
}

export async function createTowingBookingWithPayment(
  payload: CreateTowingBookingRequest,
): Promise<{ booking: Booking; payment: PaymentSession }> {
  const booking = await createTowingBooking(payload);
  const payment = await completeAdvancePayment(booking.id, 'towing');
  return { booking, payment };
}

export async function createDriverBookingWithPayment(
  payload: CreateDriverBookingRequest,
): Promise<{ booking: Booking; payment: PaymentSession }> {
  const booking = await createDriverBooking(payload);
  const payment = await completeAdvancePayment(booking.id, 'driver');
  return { booking, payment };
}
