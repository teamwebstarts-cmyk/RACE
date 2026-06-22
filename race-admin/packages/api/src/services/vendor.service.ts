import type {
  PaginatedResponse,
  VendorDetail,
  VendorListFilters,
  VendorListItem,
  VendorStatusCounts,
} from '@race/types';
import { delay } from '@race/utils';
import { appConfig } from '@race/config';

import {
  buildVendorDetail,
  createVendorRecord,
  deleteVendorRecord,
  getVendorStatusCounts,
  MOCK_VENDORS,
  updateVendorRecord,
  VENDOR_CITIES,
  type VendorUpsertInput,
} from '../mocks/vendors.mock';

function filterVendors(items: VendorListItem[], filters: VendorListFilters): VendorListItem[] {
  let result = [...items];

  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    result = result.filter(
      (v) =>
        v.businessName.toLowerCase().includes(q) ||
        v.ownerName.toLowerCase().includes(q) ||
        v.phone.includes(q) ||
        v.email.toLowerCase().includes(q),
    );
  }

  if (filters.status && filters.status !== 'ALL') {
    result = result.filter((v) => v.status === filters.status);
  }

  if (filters.verification && filters.verification !== 'ALL') {
    result = result.filter((v) => v.verificationStatus === filters.verification);
  }

  if (filters.city && filters.city !== 'ALL') {
    result = result.filter((v) => v.city === filters.city);
  }

  return result;
}

export async function getVendors(
  filters: VendorListFilters = {},
): Promise<PaginatedResponse<VendorListItem>> {
  await delay(appConfig.mockApiDelayMs);

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const filtered = filterVendors(MOCK_VENDORS, filters);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return { items, total, page, pageSize, totalPages };
}

export async function getVendorById(id: string): Promise<VendorDetail> {
  await delay(appConfig.mockApiDelayMs);

  const base = MOCK_VENDORS.find((v) => v.id === id);
  if (!base) {
    throw new Error('Vendor not found');
  }

  return buildVendorDetail(base);
}

export async function getVendorStatusCountsApi(): Promise<VendorStatusCounts> {
  await delay(100);
  return getVendorStatusCounts(MOCK_VENDORS);
}

export async function exportVendorsCsv(
  filters: VendorListFilters = {},
): Promise<VendorListItem[]> {
  await delay(300);
  return filterVendors(MOCK_VENDORS, filters);
}

export function getVendorCities(): string[] {
  return VENDOR_CITIES;
}

export async function approveVendor(id: string): Promise<VendorDetail> {
  await delay(400);
  const vendor = MOCK_VENDORS.find((v) => v.id === id);
  if (!vendor) throw new Error('Vendor not found');
  vendor.status = 'APPROVED';
  vendor.verificationStatus = 'VERIFIED';
  vendor.documentsStatus = 'VERIFIED';
  return buildVendorDetail(vendor);
}

export async function rejectVendor(id: string): Promise<VendorDetail> {
  await delay(400);
  const vendor = MOCK_VENDORS.find((v) => v.id === id);
  if (!vendor) throw new Error('Vendor not found');
  vendor.status = 'REJECTED';
  vendor.verificationStatus = 'REJECTED';
  return buildVendorDetail(vendor);
}

export async function createVendor(input: VendorUpsertInput): Promise<VendorListItem> {
  await delay(appConfig.mockApiDelayMs);
  return createVendorRecord(input);
}

export async function updateVendor(
  id: string,
  input: Partial<VendorUpsertInput>,
): Promise<VendorListItem> {
  await delay(appConfig.mockApiDelayMs);
  return updateVendorRecord(id, input);
}

export async function deleteVendor(id: string): Promise<void> {
  await delay(appConfig.mockApiDelayMs);
  deleteVendorRecord(id);
}
