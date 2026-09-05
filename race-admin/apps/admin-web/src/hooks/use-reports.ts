import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { exportReportData, getReportData, getReportTabs } from '@race/api';
import type { ReportFilters, ReportTab } from '@race/types';
import { exportToCsv } from '@race/utils';

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getRangeForPeriod(period: string) {
  const now = new Date();

  if (period === 'this_month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { dateFrom: formatDateInput(start), dateTo: formatDateInput(end) };
  }

  if (period === 'last_month') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { dateFrom: formatDateInput(start), dateTo: formatDateInput(end) };
  }

  if (period === 'this_quarter') {
    const quarter = Math.floor(now.getMonth() / 3);
    const start = new Date(now.getFullYear(), quarter * 3, 1);
    const end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
    return { dateFrom: formatDateInput(start), dateTo: formatDateInput(end) };
  }

  const start = new Date(now);
  start.setMonth(start.getMonth() - 6);
  return { dateFrom: formatDateInput(start), dateTo: formatDateInput(now) };
}

export function useReports() {
  const initialRange = useMemo(() => getRangeForPeriod('this_month'), []);
  const [activeTab, setActiveTab] = useState<ReportTab>('REVENUE');
  const [dateFrom, setDateFrom] = useState(initialRange.dateFrom);
  const [dateTo, setDateTo] = useState(initialRange.dateTo);
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
      { key: 'revenue', header: 'Value' },
    ]);
  };

  const updatePeriod = (next: string) => {
    setPeriod(next);
    if (next !== 'custom') {
      const range = getRangeForPeriod(next);
      setDateFrom(range.dateFrom);
      setDateTo(range.dateTo);
    }
  };

  return {
    tabs,
    activeTab,
    setActiveTab,
    dateFrom,
    setDateFrom: (value: string) => {
      setPeriod('custom');
      setDateFrom(value);
    },
    dateTo,
    setDateTo: (value: string) => {
      setPeriod('custom');
      setDateTo(value);
    },
    period,
    setPeriod: updatePeriod,
    ...query,
    handleExport,
  };
}
