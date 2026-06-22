import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Permission } from '@race/types';
import { Card, CardContent, CardHeader, CardTitle, ErrorState, LoadingState } from '@race/ui';

import { ActivityTimeline } from '@/components/shared/activity-timeline';
import { MetricCard } from '@/components/shared/stat-card';
import { ChartSkeleton } from '@/components/shared/chart-card';
import { RecentBookingsTable, RecentVendorsTable } from '@/components/dashboard/dashboard-tables';
import { AlertsPanel, WelcomeBanner } from '@/components/dashboard/welcome-banner';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { useDashboardQuery } from '@/hooks/use-dashboard';
import { useAuthStore } from '@/stores/auth.store';

const RevenueChart = lazy(() =>
  import('@/components/dashboard/dashboard-charts').then((m) => ({ default: m.RevenueChart })),
);
const BookingsChart = lazy(() =>
  import('@/components/dashboard/dashboard-charts').then((m) => ({ default: m.BookingsChart })),
);
const TopServicesChart = lazy(() =>
  import('@/components/dashboard/dashboard-charts').then((m) => ({ default: m.TopServicesChart })),
);
const DriverPerformanceChart = lazy(() =>
  import('@/components/dashboard/dashboard-charts').then((m) => ({ default: m.DriverPerformanceChart })),
);

export function DashboardPageContent() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isError, refetch } = useDashboardQuery();

  if (isLoading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  if (isError || !data) {
    return <ErrorState message="Failed to load dashboard data" onRetry={() => void refetch()} />;
  }

  const primaryStats = data.stats.slice(0, 4);
  const secondaryStats = data.stats.slice(4);

  return (
    <PermissionGuard permission={Permission.DASHBOARD_VIEW} permissions={user?.permissions}>
      <WelcomeBanner name={user?.name} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:gap-4">
        {primaryStats.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 xl:gap-4">
        {secondaryStats.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Suspense fallback={<ChartSkeleton height={300} />}>
            <RevenueChart data={data.revenueChart} />
          </Suspense>
        </div>
        <Suspense fallback={<ChartSkeleton height={300} />}>
          <DriverPerformanceChart />
        </Suspense>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Suspense fallback={<ChartSkeleton />}>
          <BookingsChart data={data.bookingsChart} />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <TopServicesChart data={data.topServices} />
        </Suspense>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-4">
            <CardTitle className="text-[15px]">Recent Activities</CardTitle>
            <Link to="/reports" className="text-xs font-medium text-primary-dark hover:underline">
              View All
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            <ActivityTimeline items={data.recentActivities} />
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <AlertsPanel />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <RecentBookingsTable data={data.recentBookings} />
        <RecentVendorsTable data={data.recentVendors} />
      </div>
    </PermissionGuard>
  );
}
