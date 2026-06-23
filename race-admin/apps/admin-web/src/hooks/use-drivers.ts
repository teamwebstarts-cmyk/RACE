import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import {
  exportDriversCsv,
  getDrivers,
  getDriverStatusCountsApi,
  getDriverVendors,
} from '@race/api';
import type { DriverListFilters } from '@race/types';

const PAGE_SIZE = 10;

export function useDrivers() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('ALL');
  const [vendorId, setVendorId] = useState<string>('ALL');
  const [city, setCity] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<string>('ALL');

  const tabStatus = activeTab === 'ALL' ? status : activeTab;

  const filters: DriverListFilters = useMemo(
    () => ({
      search,
      status: tabStatus as DriverListFilters['status'],
      vendorId,
      city,
      page,
      pageSize: PAGE_SIZE,
    }),
    [search, tabStatus, vendorId, city, page],
  );

  const query = useQuery({
    queryKey: ['drivers', filters],
    queryFn: () => getDrivers(filters),
    placeholderData: (prev) => prev,
  });

  const countsQuery = useQuery({
    queryKey: ['driver-status-counts'],
    queryFn: getDriverStatusCountsApi,
  });

  const vendorsQuery = useQuery({
    queryKey: ['driver-vendors'],
    queryFn: getDriverVendors,
  });

  const cities = ['Bhubaneswar', 'Cuttack', 'Puri', 'Rourkela', 'Berhampur'];
  const vendors = vendorsQuery.data ?? [];

  const resetPage = () => setPage(1);

  return {
    ...query,
    counts: countsQuery.data,
    search,
    setSearch: (v: string) => {
      setSearch(v);
      resetPage();
    },
    status,
    setStatus: (v: string) => {
      setStatus(v);
      resetPage();
    },
    vendorId,
    setVendorId: (v: string) => {
      setVendorId(v);
      resetPage();
    },
    city,
    setCity: (v: string) => {
      setCity(v);
      resetPage();
    },
    page,
    setPage,
    pageSize: PAGE_SIZE,
    cities,
    vendors,
    activeTab,
    setActiveTab: (tab: string) => {
      setActiveTab(tab);
      resetPage();
    },
    handleExport: () => exportDriversCsv({ search, status: tabStatus as DriverListFilters['status'], vendorId, city }),
  };
}
