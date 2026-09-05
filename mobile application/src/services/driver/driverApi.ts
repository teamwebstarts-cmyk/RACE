import { api } from '../api';
import { API_ENDPOINTS } from '../../config/api';
import type { ApiSuccessResponse } from '../../types/auth';

export type DriverJobBooking = {
  bookingType: 'towing' | 'driver';
  id: string;
  bookingNumber: string;
  status: string;
  pickup?: {
    label?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  dropoff?: {
    label?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  } | null;
  estimatedFare?: number;
  createdAt: string;
  distanceKm?: number;
  serviceLabel?: string;
  vendorId?: string;
  assignedFleetVehicleLabel?: string;
  vendorApproved?: boolean;
};

export async function setDriverAvailability(isAvailable: boolean): Promise<{
  isAvailable: boolean;
  message: string;
}> {
  const { data } = await api.patch<
    ApiSuccessResponse<{ isAvailable: boolean; message: string }>
  >(API_ENDPOINTS.driverAvailability, { isAvailable });
  return data.data;
}

export async function listDriverJobs(params?: {
  status?: string;
  type?: 'towing' | 'driver';
}): Promise<DriverJobBooking[]> {
  const { data } = await api.get<ApiSuccessResponse<DriverJobBooking[]>>(
    API_ENDPOINTS.driverMyBookings,
    { params },
  );
  return data.data ?? [];
}

export async function listDriverJobOffers(): Promise<DriverJobBooking[]> {
  const { data } = await api.get<ApiSuccessResponse<DriverJobBooking[]>>(
    API_ENDPOINTS.driverBookingOffers,
  );
  return data.data ?? [];
}

export async function getDriverActiveJob(): Promise<DriverJobBooking | null> {
  const { data } = await api.get<
    ApiSuccessResponse<{ active: boolean; booking?: DriverJobBooking } | DriverJobBooking | null>
  >(API_ENDPOINTS.driverActiveBooking);
  const payload = data.data;
  if (!payload) return null;
  if (typeof payload === 'object' && 'active' in payload) {
    return payload.active && payload.booking ? payload.booking : null;
  }
  return payload as DriverJobBooking;
}

export async function updateDriverLocation(
  latitude: number,
  longitude: number,
): Promise<{ location: { latitude: number; longitude: number }; updatedAt: string }> {
  const { data } = await api.patch<
    ApiSuccessResponse<{ location: { latitude: number; longitude: number }; updatedAt: string }>
  >(API_ENDPOINTS.driverLocation, { latitude, longitude });
  return data.data;
}

export async function updateDriverBookingStatus(
  bookingId: string,
  bookingType: 'towing' | 'driver',
  status: string,
  tripOtp?: string,
): Promise<unknown> {
  const { data } = await api.patch(API_ENDPOINTS.driverBookingStatus(bookingId), {
    bookingType,
    status,
    ...(tripOtp ? { tripOtp } : {}),
  });
  return data.data;
}

export async function acceptDriverJob(
  bookingId: string,
  bookingType: 'towing' | 'driver',
): Promise<unknown> {
  const { data } = await api.post(API_ENDPOINTS.driverBookingAccept(bookingId), { bookingType });
  return data.data;
}

export async function rejectDriverJob(
  bookingId: string,
  bookingType: 'towing' | 'driver',
): Promise<unknown> {
  const { data } = await api.post(API_ENDPOINTS.driverBookingReject(bookingId), { bookingType });
  return data.data;
}
