import { Permission } from '@race/types';

import { PermissionGuard } from '@/components/guards/permission-guard';
import { PageHeader } from '@/components/layout/page-header';
import { SettingsContent } from '@/components/settings/settings-content';
import { useAuthStore } from '@/stores/auth.store';

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <PermissionGuard permission={Permission.SETTINGS_VIEW} permissions={user?.permissions}>
      <PageHeader
        title="Settings"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Settings' }]}
      />
      <SettingsContent />
    </PermissionGuard>
  );
}
