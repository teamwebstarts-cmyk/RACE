import { Permission } from '@race/types';

import { PermissionGuard } from '@/components/guards/permission-guard';
import { PageHeader } from '@/components/layout/page-header';
import { ReportsContent } from '@/components/reports/reports-content';
import { useAuthStore } from '@/stores/auth.store';

export function ReportsPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <PermissionGuard permission={Permission.REPORTS_VIEW} permissions={user?.permissions}>
      <PageHeader
        title="Reports & Analytics"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Reports' }]}
      />
      <ReportsContent />
    </PermissionGuard>
  );
}
