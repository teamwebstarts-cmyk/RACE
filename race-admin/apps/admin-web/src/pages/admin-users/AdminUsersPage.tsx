import { Permission } from '@race/types';

import { AdminUsersContent } from '@/components/admin-users/admin-users-content';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PageHeader } from '@/components/layout/page-header';
import { useAuthStore } from '@/stores/auth.store';

export function AdminUsersPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <PermissionGuard permission={Permission.ADMIN_USERS_VIEW} permissions={user?.permissions}>
      <PageHeader
        title="Admin Users"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Admin Users' }]}
      />
      <AdminUsersContent />
    </PermissionGuard>
  );
}
