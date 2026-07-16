import { api } from '../api';
import { API_ENDPOINTS } from '../../config/api';
import type { ApiSuccessResponse } from '../../types/auth';
import type { DriverJobBooking } from '../driver/driverApi';

export type VendorAssignResult = {
  id: string;
  status: string;
  bookingNumber: string;
  driverId?: string;
  vendorId?: string;
  driver?: { id: string; name: string; phone: string; rating: number };
  assignedFleetVehicleLabel?: string;
  message?: string;
};

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
}): Promise<VendorAssignResult> {
  const { data } = await api.post<ApiSuccessResponse<VendorAssignResult>>(
    API_ENDPOINTS.vendorBookingAssign(payload.bookingId),
    {
      bookingType: payload.bookingType,
      driverId: payload.driverId,
      vehicleId: payload.vehicleId,
    },
  );
  return data.data;
}
