import { api } from '../api';
import { API_ENDPOINTS } from '../../config/api';
import type { ApiSuccessResponse } from '../../types/auth';
import type { DriverJobBooking } from '../driver/driverApi';

export type VendorApproveResult = {
  id: string;
  status: string;
  bookingNumber: string;
  vendorId?: string;
  assignedFleetVehicleLabel?: string;
  message?: string;
};

/** @deprecated Use VendorApproveResult — assign API kept for older clients. */
export type VendorAssignResult = VendorApproveResult & {
  driverId?: string;
  driver?: { id: string; name: string; phone: string; rating: number };
};

export async function listVendorBookingOffers(): Promise<DriverJobBooking[]> {
  const { data } = await api.get<ApiSuccessResponse<DriverJobBooking[]>>(
    API_ENDPOINTS.vendorBookingOffers,
  );
  return data.data ?? [];
}

export async function approveVendorBooking(payload: {
  bookingId: string;
  bookingType: 'towing' | 'driver';
  vehicleId: string;
}): Promise<VendorApproveResult> {
  const { data } = await api.post<ApiSuccessResponse<VendorApproveResult>>(
    API_ENDPOINTS.vendorBookingApprove(payload.bookingId),
    {
      bookingType: payload.bookingType,
      vehicleId: payload.vehicleId,
    },
  );
  return data.data;
}

/** @deprecated Use approveVendorBooking — vendor now approves with vehicle only. */
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
