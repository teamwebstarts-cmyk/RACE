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
