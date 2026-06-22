import type {
  BookingDetail,
  BookingListFilters,
  BookingListItem,
  PaginatedResponse,
} from '@race/types';
import { delay } from '@race/utils';
import { appConfig } from '@race/config';

import {
  BOOKING_SERVICE_TYPES,
  buildBookingDetail,
  createBookingRecord,
  deleteBookingRecord,
  filterBookingsByDate,
  getBookingStatusCounts,
  MOCK_BOOKINGS,
  updateBookingRecord,
  type BookingUpsertInput,
} from '../mocks/bookings.mock';

function filterBookings(items: BookingListItem[], filters: BookingListFilters): BookingListItem[] {
  let result = [...items];

  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    result = result.filter(
      (b) =>
        b.bookingNumber.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        (b.driverName?.toLowerCase().includes(q) ?? false) ||
        b.vendorName.toLowerCase().includes(q),
    );
  }

  if (filters.status && filters.status !== 'ALL') {
    result = result.filter((b) => b.status === filters.status);
  }

  if (filters.serviceType && filters.serviceType !== 'ALL') {
    result = result.filter((b) => b.serviceType === filters.serviceType);
  }

  result = filterBookingsByDate(result, filters.dateFrom, filters.dateTo);

  return result;
}

export async function getBookings(
  filters: BookingListFilters = {},
): Promise<PaginatedResponse<BookingListItem>> {
  await delay(appConfig.mockApiDelayMs);

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const filtered = filterBookings(MOCK_BOOKINGS, filters);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;

  return {
    items: filtered.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getBookingById(id: string): Promise<BookingDetail> {
  await delay(appConfig.mockApiDelayMs);

  const base = MOCK_BOOKINGS.find((b) => b.id === id);
  if (!base) throw new Error('Booking not found');

  return buildBookingDetail(base);
}

export async function getBookingStatusCountsApi() {
  await delay(100);
  return getBookingStatusCounts(MOCK_BOOKINGS);
}

export async function exportBookingsCsv(filters: BookingListFilters = {}): Promise<BookingListItem[]> {
  await delay(300);
  return filterBookings(MOCK_BOOKINGS, filters);
}

export function getBookingServiceTypes() {
  return BOOKING_SERVICE_TYPES;
}

export async function createBooking(input: BookingUpsertInput): Promise<BookingListItem> {
  await delay(appConfig.mockApiDelayMs);
  return createBookingRecord(input);
}

export async function updateBooking(
  id: string,
  input: Partial<BookingUpsertInput>,
): Promise<BookingListItem> {
  await delay(appConfig.mockApiDelayMs);
  return updateBookingRecord(id, input);
}

export async function deleteBooking(id: string): Promise<void> {
  await delay(appConfig.mockApiDelayMs);
  deleteBookingRecord(id);
}
