import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { exportReportData, getReportData, getReportTabs } from '@race/api';
import type { ReportFilters, ReportTab } from '@race/types';
import { exportToCsv } from '@race/utils';

export function useReports() {
  const [activeTab, setActiveTab] = useState<ReportTab>('REVENUE');
  const [dateFrom, setDateFrom] = useState('2025-06-01');
  const [dateTo, setDateTo] = useState('2025-06-17');
  const [period, setPeriod] = useState('this_month');

  const tabs = useMemo(() => getReportTabs(), []);

  const filters: ReportFilters = useMemo(
    () => ({ tab: activeTab, dateFrom, dateTo, period }),
    [activeTab, dateFrom, dateTo, period],
  );

  const query = useQuery({
    queryKey: ['reports', filters],
    queryFn: () => getReportData(filters),
  });

  const handleExport = async () => {
    const data = await exportReportData(filters);
    exportToCsv(`report-${activeTab.toLowerCase()}.csv`, data, [
      { key: 'label', header: 'Date' },
      { key: 'revenue', header: 'Revenue' },
    ]);
  };

  return {
    tabs,
    activeTab,
    setActiveTab,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    period,
    setPeriod,
    ...query,
    handleExport,
  };
}
