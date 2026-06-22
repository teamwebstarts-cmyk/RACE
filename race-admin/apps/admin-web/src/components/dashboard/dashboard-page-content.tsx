import { Link } from 'react-router-dom';
import { Permission } from '@race/types';
import { Card, CardContent, CardHeader, CardTitle, ErrorState, LoadingState } from '@race/ui';

import { ActivityTimeline } from '@/components/shared/activity-timeline';
import { StatCard } from '@/components/shared/stat-card';
import {
  BookingsChart,
  RevenueChart,
  TopServicesChart,
} from '@/components/dashboard/dashboard-charts';
import { RecentBookingsTable, RecentVendorsTable } from '@/components/dashboard/dashboard-tables';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PageHeader } from '@/components/layout/page-header';
import { useDashboardQuery } from '@/hooks/use-dashboard';
import { useAuthStore } from '@/stores/auth.store';

export function DashboardPageContent() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isError, refetch } = useDashboardQuery();

  if (isLoading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  if (isError || !data) {
    return <ErrorState message="Failed to load dashboard data" onRetry={() => void refetch()} />;
  }

  return (
    <PermissionGuard permission={Permission.DASHBOARD_VIEW} permissions={user?.permissions}>
      <PageHeader
        title="Dashboard"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Dashboard' }]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.stats.map((metric) => (
          <StatCard key={metric.id} metric={metric} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RevenueChart data={data.revenueChart} />
        <BookingsChart data={data.bookingsChart} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activities</CardTitle>
            <Link to="/reports" className="text-sm font-medium text-[#F5A623] hover:underline">
              View All
            </Link>
          </CardHeader>
          <CardContent>
            <ActivityTimeline items={data.recentActivities} />
          </CardContent>
        </Card>

        <div className="xl:col-span-2">
          <TopServicesChart data={data.topServices} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RecentBookingsTable data={data.recentBookings} />
        <RecentVendorsTable data={data.recentVendors} />
      </div>
    </PermissionGuard>
  );
}
