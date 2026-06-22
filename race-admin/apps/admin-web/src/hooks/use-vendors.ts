import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import {
  exportVendorsCsv,
  getVendorCities,
  getVendors,
  getVendorStatusCountsApi,
} from '@race/api';
import type { VendorListFilters } from '@race/types';
import { exportToCsv } from '@race/utils';

const PAGE_SIZE = 10;

export function useVendors() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('ALL');
  const [verification, setVerification] = useState<string>('ALL');
  const [city, setCity] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<string>('ALL');

  const tabStatus = activeTab === 'ALL' ? status : activeTab;

  const filters: VendorListFilters = useMemo(
    () => ({
      search,
      status: tabStatus as VendorListFilters['status'],
      verification: verification as VendorListFilters['verification'],
      city,
      page,
      pageSize: PAGE_SIZE,
    }),
    [search, tabStatus, verification, city, page],
  );

  const query = useQuery({
    queryKey: ['vendors', filters],
    queryFn: () => getVendors(filters),
    placeholderData: (prev) => prev,
  });

  const countsQuery = useQuery({
    queryKey: ['vendor-status-counts'],
    queryFn: getVendorStatusCountsApi,
  });

  const cities = useMemo(() => getVendorCities(), []);

  const handleExport = async () => {
    const rows = await exportVendorsCsv({
      search,
      status: tabStatus as VendorListFilters['status'],
      verification: verification as VendorListFilters['verification'],
      city,
    });
    exportToCsv('vendors.csv', rows, [
      { key: 'businessName', header: 'Vendor Name' },
      { key: 'ownerName', header: 'Owner' },
      { key: 'location', header: 'Location' },
      { key: 'vehicleCount', header: 'Vehicles' },
      { key: 'driverCount', header: 'Drivers' },
      { key: 'rating', header: 'Rating' },
      { key: 'status', header: 'Status' },
    ]);
  };

  const resetPageOnFilter = () => setPage(1);

  return {
    ...query,
    counts: countsQuery.data,
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
    verification,
    setVerification: (v: string) => {
      setVerification(v);
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
    activeTab,
    setActiveTab: (tab: string) => {
      setActiveTab(tab);
      resetPageOnFilter();
    },
    handleExport,
  };
}
