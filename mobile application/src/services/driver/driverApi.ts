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

export async function getDriverActiveJob(): Promise<DriverJobBooking | null> {
  const { data } = await api.get<ApiSuccessResponse<DriverJobBooking | null>>(
    API_ENDPOINTS.driverActiveBooking,
  );
  return data.data ?? null;
}
