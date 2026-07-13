import { API_ENDPOINTS } from '../config/api';
import type { ApiSuccessResponse } from '../types/auth';
import type { DriverJobBooking } from '../types/partner';
import { api } from './api';

export async function listVendorBookingOffers(): Promise<DriverJobBooking[]> {
  const { data } = await api.get<ApiSuccessResponse<DriverJobBooking[]>>(
    API_ENDPOINTS.vendorBookingOffers,
  );
  return data.data ?? [];
}

export async function assignVendorBooking(payload: {
  bookingId: string;
  bookingType: 'towing' | 'driver';
  driverId: string;
  vehicleId?: string;
}): Promise<{
  id: string;
  status: string;
  bookingNumber: string;
  driver?: { id: string; name: string; phone: string; rating: number };
  assignedFleetVehicleLabel?: string;
  message?: string;
}> {
  const { data } = await api.post<
    ApiSuccessResponse<{
      id: string;
      status: string;
      bookingNumber: string;
      driver?: { id: string; name: string; phone: string; rating: number };
      assignedFleetVehicleLabel?: string;
      message?: string;
    }>
  >(API_ENDPOINTS.vendorBookingAssign(payload.bookingId), {
    bookingType: payload.bookingType,
    driverId: payload.driverId,
    vehicleId: payload.vehicleId,
  });
  return data.data;
}
