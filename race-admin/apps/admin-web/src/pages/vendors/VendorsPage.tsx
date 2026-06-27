import { Permission } from '@race/types';

import { PermissionGuard } from '@/components/guards/permission-guard';
import { PageHeader } from '@/components/layout/page-header';
import { VendorList } from '@/components/vendors/vendor-list';
import { useAuthStore } from '@/stores/auth.store';

export function VendorsPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <PermissionGuard permission={Permission.VENDORS_VIEW} permissions={user?.permissions}>
      <PageHeader
        title="Vendors"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Vendors' }]}
      />
      <VendorList />
    </PermissionGuard>
  );
}
