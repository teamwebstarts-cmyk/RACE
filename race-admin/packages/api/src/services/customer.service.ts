import type {
  CustomerDetail,
  CustomerListFilters,
  CustomerListItem,
  PaginatedResponse,
} from '@race/types';
import { delay } from '@race/utils';
import { appConfig } from '@race/config';

import {
  buildCustomerDetail,
  createCustomerRecord,
  CUSTOMER_CITIES,
  deleteCustomerRecord,
  MOCK_CUSTOMERS,
  updateCustomerRecord,
  type CustomerUpsertInput,
} from '../mocks/customers.mock';

function filterCustomers(
  items: CustomerListItem[],
  filters: CustomerListFilters,
): CustomerListItem[] {
  let result = [...items];

  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.customerId.toLowerCase().includes(q),
    );
  }

  if (filters.status && filters.status !== 'ALL') {
    result = result.filter((c) => c.status === filters.status);
  }

  if (filters.city && filters.city !== 'ALL') {
    result = result.filter((c) => c.city === filters.city);
  }

  return result;
}

export async function getCustomers(
  filters: CustomerListFilters = {},
): Promise<PaginatedResponse<CustomerListItem>> {
  await delay(appConfig.mockApiDelayMs);

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const filtered = filterCustomers(MOCK_CUSTOMERS, filters);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return { items, total, page, pageSize, totalPages };
}

export async function getCustomerById(id: string): Promise<CustomerDetail> {
  await delay(appConfig.mockApiDelayMs);

  const base = MOCK_CUSTOMERS.find((c) => c.id === id);
  if (!base) {
    throw new Error('Customer not found');
  }

  return buildCustomerDetail(base);
}

export async function exportCustomersCsv(
  filters: CustomerListFilters = {},
): Promise<CustomerListItem[]> {
  await delay(300);
  return filterCustomers(MOCK_CUSTOMERS, filters);
}

export function getCustomerCities(): string[] {
  return CUSTOMER_CITIES;
}

export async function createCustomer(input: CustomerUpsertInput): Promise<CustomerListItem> {
  await delay(appConfig.mockApiDelayMs);
  return createCustomerRecord(input);
}

export async function updateCustomer(
  id: string,
  input: Partial<CustomerUpsertInput>,
): Promise<CustomerListItem> {
  await delay(appConfig.mockApiDelayMs);
  return updateCustomerRecord(id, input);
}

export async function deleteCustomer(id: string): Promise<void> {
  await delay(appConfig.mockApiDelayMs);
  deleteCustomerRecord(id);
}
