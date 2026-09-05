import { Permission } from '@race/types';

import { PermissionGuard } from '@/components/guards/permission-guard';
import { PageHeader } from '@/components/layout/page-header';
import { SubscriptionsContent } from '@/components/subscriptions/subscriptions-content';
import { useAuthStore } from '@/stores/auth.store';

export function SubscriptionsPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <PermissionGuard permission={Permission.SUBSCRIPTIONS_VIEW} permissions={user?.permissions}>
      <PageHeader
        title="Subscriptions"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Subscriptions' }]}
      />
      <SubscriptionsContent />
    </PermissionGuard>
  );
}
