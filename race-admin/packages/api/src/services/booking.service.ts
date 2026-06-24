import type {
  BookingDetail,
  BookingListFilters,
  BookingListItem,
  PaginatedResponse,
} from '@race/types';

import { apiDelete, apiGet, apiPatch, apiPost } from '../http';

export async function getBookings(
  filters: BookingListFilters = {},
): Promise<PaginatedResponse<BookingListItem>> {
  return apiGet<PaginatedResponse<BookingListItem>>('/bookings', filters as Record<string, unknown>);
}

export async function getBookingStatusCountsApi() {
  return apiGet<Record<string, number>>('/bookings/counts');
}

export async function getBookingById(id: string): Promise<BookingDetail> {
  return apiGet<BookingDetail>(`/bookings/${id}`);
}

export async function createBooking(input: Record<string, string | number>) {
  return apiPost<BookingListItem>('/bookings', input);
}

export async function updateBooking(id: string, input: Record<string, string | number>) {
  return apiPatch<BookingListItem>(`/bookings/${id}`, input);
}

export async function deleteBooking(id: string) {
  await apiDelete(`/bookings/${id}`);
}

export async function assignBookingVendor(id: string, vendorId: string) {
  return apiPost<BookingListItem>(`/bookings/${id}/assign-vendor`, { vendorId });
}

export async function assignBookingDriver(id: string, driverId: string) {
  return apiPost<BookingListItem>(`/bookings/${id}/assign-driver`, { driverId });
}

export async function updateBookingStatus(
  id: string,
  status: string,
  options?: { reason?: string; amount?: number },
) {
  return apiPost<BookingListItem>(`/bookings/${id}/status`, { status, ...options });
}

export async function exportBookingsCsv(filters: BookingListFilters = {}) {
  const result = await getBookings({ ...filters, page: 1, pageSize: 10000 });
  return result.items;
}

export function getBookingServiceTypes() {
  return [
    { label: 'Towing', value: 'towing' },
    { label: 'Roadside', value: 'roadside' },
    { label: 'Driver', value: 'driver' },
  ];
}
