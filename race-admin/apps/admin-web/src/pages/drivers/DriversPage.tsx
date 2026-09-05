import { Permission } from '@race/types';

import { DriverList } from '@/components/drivers/driver-list';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PageHeader } from '@/components/layout/page-header';
import { useAuthStore } from '@/stores/auth.store';

export function DriversPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <PermissionGuard permission={Permission.DRIVERS_VIEW} permissions={user?.permissions}>
      <PageHeader
        title="Drivers"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Drivers' }]}
      />
      <DriverList />
    </PermissionGuard>
  );
}
