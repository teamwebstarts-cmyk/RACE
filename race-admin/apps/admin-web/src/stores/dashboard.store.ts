import { create } from 'zustand';

import type { DashboardPeriod } from '@race/api';

interface DashboardState {
  period: DashboardPeriod;
  setPeriod: (period: DashboardPeriod) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  period: 'this_month',
  setPeriod: (period) => set({ period }),
}));
