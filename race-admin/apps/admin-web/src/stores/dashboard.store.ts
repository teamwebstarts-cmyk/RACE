import { create } from 'zustand';

import type { DashboardPeriod } from '@race/api';

interface DashboardState {
  period: DashboardPeriod;
  selectedDate: string;
  setPeriod: (period: DashboardPeriod) => void;
  setSelectedDate: (date: string) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  period: 'this_month',
  selectedDate: '17 June 2025',
  setPeriod: (period) => set({ period }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
}));
