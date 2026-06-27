import { Permission } from '@race/types';
import { hasPermission } from '@race/utils';

export function PermissionGuard({
  permission,
  permissions,
  children,
  fallback = null,
}: {
  permission?: Permission | Permission[];
  permissions?: Permission[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const userPermissions = permissions ?? [];
  const required = permission ?? Permission.DASHBOARD_VIEW;

  if (!hasPermission(userPermissions, required)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export function RoleGuard({
  role,
  allowed,
  children,
  fallback = null,
}: {
  role: string;
  allowed: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const allowedList = Array.isArray(allowed) ? allowed : [allowed];
  if (!allowedList.includes(role)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
