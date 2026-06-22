import type {
  DriverDetail,
  DriverListFilters,
  DriverListItem,
  PaginatedResponse,
  VendorOption,
} from '@race/types';
import { delay } from '@race/utils';
import { appConfig } from '@race/config';

import {
  buildDriverDetail,
  createDriverRecord,
  deleteDriverRecord,
  DRIVER_CITIES,
  DRIVER_VENDORS,
  getDriverStatusCounts,
  MOCK_DRIVERS,
  updateDriverRecord,
  type DriverUpsertInput,
} from '../mocks/drivers.mock';

function filterDrivers(items: DriverListItem[], filters: DriverListFilters): DriverListItem[] {
  let result = [...items];

  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    result = result.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.phone.includes(q) ||
        d.licenseNo.toLowerCase().includes(q),
    );
  }

  if (filters.status && filters.status !== 'ALL') {
    result = result.filter((d) => d.status === filters.status);
  }

  if (filters.vendorId && filters.vendorId !== 'ALL') {
    result = result.filter((d) => d.vendorId === filters.vendorId);
  }

  if (filters.city && filters.city !== 'ALL') {
    result = result.filter((d) => d.city === filters.city);
  }

  return result;
}

export async function getDrivers(
  filters: DriverListFilters = {},
): Promise<PaginatedResponse<DriverListItem>> {
  await delay(appConfig.mockApiDelayMs);

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const filtered = filterDrivers(MOCK_DRIVERS, filters);
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

export async function getDriverById(id: string): Promise<DriverDetail> {
  await delay(appConfig.mockApiDelayMs);

  const base = MOCK_DRIVERS.find((d) => d.id === id);
  if (!base) throw new Error('Driver not found');

  return buildDriverDetail(base);
}

export async function getDriverStatusCountsApi() {
  await delay(100);
  return getDriverStatusCounts(MOCK_DRIVERS);
}

export async function exportDriversCsv(filters: DriverListFilters = {}): Promise<DriverListItem[]> {
  await delay(300);
  return filterDrivers(MOCK_DRIVERS, filters);
}

export function getDriverCities(): string[] {
  return DRIVER_CITIES;
}

export function getDriverVendors(): VendorOption[] {
  return DRIVER_VENDORS;
}

export async function createDriver(input: DriverUpsertInput): Promise<DriverListItem> {
  await delay(appConfig.mockApiDelayMs);
  return createDriverRecord(input);
}

export async function updateDriver(
  id: string,
  input: Partial<DriverUpsertInput>,
): Promise<DriverListItem> {
  await delay(appConfig.mockApiDelayMs);
  return updateDriverRecord(id, input);
}

export async function deleteDriver(id: string): Promise<void> {
  await delay(appConfig.mockApiDelayMs);
  deleteDriverRecord(id);
}
