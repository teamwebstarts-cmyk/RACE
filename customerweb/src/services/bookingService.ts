import { API_ENDPOINTS } from '../config/api';
import type { Booking } from '../types/models';
import { api, unwrapApi } from './api';

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
  driver?: { id: string; name: string; rating?: number; phone?: string };
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
    driver: item.driver,
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
    return mapBooking({ ...towing, bookingType: 'towing', serviceLabel: 'Towing' });
  } catch {
    const driver = await unwrapApi<CombinedBookingItem>(
      api.get(API_ENDPOINTS.driverBooking(id)),
    );
    return mapBooking({ ...driver, bookingType: 'driver', serviceLabel: 'Driver Hire' });
  }
}
