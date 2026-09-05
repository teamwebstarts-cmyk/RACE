import { Permission } from '@race/types';

import { FinancialContent } from '@/components/financial/financial-content';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PageHeader } from '@/components/layout/page-header';
import { useAuthStore } from '@/stores/auth.store';

export function FinancialPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <PermissionGuard permission={Permission.FINANCE_VIEW} permissions={user?.permissions}>
      <PageHeader
        title="Financial Overview"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Financial' }]}
      />
      <FinancialContent />
    </PermissionGuard>
  );
}
