import { Permission } from '@race/types';

import { CustomerList } from '@/components/customers/customer-list';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PageHeader } from '@/components/layout/page-header';
import { useAuthStore } from '@/stores/auth.store';

export function CustomersPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <PermissionGuard permission={Permission.CUSTOMERS_VIEW} permissions={user?.permissions}>
      <PageHeader
        title="Customers"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }]}
      />
      <CustomerList />
    </PermissionGuard>
  );
}
