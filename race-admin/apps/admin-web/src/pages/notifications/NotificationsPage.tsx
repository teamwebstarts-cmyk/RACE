import { Permission } from '@race/types';

import { PermissionGuard } from '@/components/guards/permission-guard';
import { PageHeader } from '@/components/layout/page-header';
import { NotificationsContent } from '@/components/notifications/notifications-content';
import { useAuthStore } from '@/stores/auth.store';

export function NotificationsPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <PermissionGuard permission={Permission.NOTIFICATIONS_VIEW} permissions={user?.permissions}>
      <PageHeader
        title="Notifications"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Notifications' }]}
      />
      <NotificationsContent />
    </PermissionGuard>
  );
}
