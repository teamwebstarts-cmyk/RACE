import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { exportCustomersCsv, getCustomerCities, getCustomers } from '@race/api';
import type { CustomerListFilters } from '@race/types';
import { exportToCsv } from '@race/utils';

const PAGE_SIZE = 10;

export function useCustomers() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('ALL');
  const [city, setCity] = useState<string>('ALL');
  const [page, setPage] = useState(1);

  const filters: CustomerListFilters = useMemo(
    () => ({
      search,
      status: status as CustomerListFilters['status'],
      city,
      page,
      pageSize: PAGE_SIZE,
    }),
    [search, status, city, page],
  );

  const query = useQuery({
    queryKey: ['customers', filters],
    queryFn: () => getCustomers(filters),
    placeholderData: (prev) => prev,
  });

  const citiesQuery = useQuery({
    queryKey: ['customer-cities'],
    queryFn: getCustomerCities,
  });
  const cities = citiesQuery.data ?? [];

  const handleExport = async () => {
    const rows = await exportCustomersCsv({
      search,
      status: status as CustomerListFilters['status'],
      city,
    });
    exportToCsv('customers.csv', rows, [
      { key: 'customerId', header: 'Customer ID' },
      { key: 'name', header: 'Name' },
      { key: 'phone', header: 'Phone' },
      { key: 'email', header: 'Email' },
      { key: 'totalBookings', header: 'Total Bookings' },
      { key: 'status', header: 'Status' },
      { key: 'joinedAt', header: 'Joined Date' },
    ]);
  };

  const resetPageOnFilter = () => setPage(1);

  return {
    ...query,
    search,
    setSearch: (v: string) => {
      setSearch(v);
      resetPageOnFilter();
    },
    status,
    setStatus: (v: string) => {
      setStatus(v);
      resetPageOnFilter();
    },
    city,
    setCity: (v: string) => {
      setCity(v);
      resetPageOnFilter();
    },
    page,
    setPage,
    pageSize: PAGE_SIZE,
    cities,
    handleExport,
  };
}
