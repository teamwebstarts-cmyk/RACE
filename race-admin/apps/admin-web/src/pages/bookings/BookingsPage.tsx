import { Permission } from '@race/types';

import { BookingList } from '@/components/bookings/booking-list';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PageHeader } from '@/components/layout/page-header';
import { useAuthStore } from '@/stores/auth.store';

export function BookingsPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <PermissionGuard permission={Permission.BOOKINGS_VIEW} permissions={user?.permissions}>
      <PageHeader
        title="Bookings"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Bookings' }]}
      />
      <BookingList />
    </PermissionGuard>
  );
}
