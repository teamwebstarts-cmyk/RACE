export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  OPERATIONS_ADMIN = 'OPERATIONS_ADMIN',
  FINANCE_ADMIN = 'FINANCE_ADMIN',
  VERIFICATION_ADMIN = 'VERIFICATION_ADMIN',
  SUPPORT_ADMIN = 'SUPPORT_ADMIN',
}

export enum AdminPermission {
  DASHBOARD_VIEW = 'DASHBOARD_VIEW',
  CUSTOMERS_VIEW = 'CUSTOMERS_VIEW',
  CUSTOMERS_MANAGE = 'CUSTOMERS_MANAGE',
  VENDORS_VIEW = 'VENDORS_VIEW',
  VENDORS_MANAGE = 'VENDORS_MANAGE',
  VENDORS_APPROVE = 'VENDORS_APPROVE',
  DRIVERS_VIEW = 'DRIVERS_VIEW',
  DRIVERS_MANAGE = 'DRIVERS_MANAGE',
  DRIVERS_APPROVE = 'DRIVERS_APPROVE',
  BOOKINGS_VIEW = 'BOOKINGS_VIEW',
  BOOKINGS_MANAGE = 'BOOKINGS_MANAGE',
  FINANCE_VIEW = 'FINANCE_VIEW',
  FINANCE_MANAGE = 'FINANCE_MANAGE',
  REPORTS_VIEW = 'REPORTS_VIEW',
  SUBSCRIPTIONS_VIEW = 'SUBSCRIPTIONS_VIEW',
  SUBSCRIPTIONS_MANAGE = 'SUBSCRIPTIONS_MANAGE',
  ADMIN_USERS_VIEW = 'ADMIN_USERS_VIEW',
  ADMIN_USERS_MANAGE = 'ADMIN_USERS_MANAGE',
  SETTINGS_VIEW = 'SETTINGS_VIEW',
  SETTINGS_MANAGE = 'SETTINGS_MANAGE',
  AUDIT_LOGS_VIEW = 'AUDIT_LOGS_VIEW',
  NOTIFICATIONS_VIEW = 'NOTIFICATIONS_VIEW',
}

const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  [AdminRole.SUPER_ADMIN]: Object.values(AdminPermission),
  [AdminRole.OPERATIONS_ADMIN]: [
    AdminPermission.DASHBOARD_VIEW,
    AdminPermission.CUSTOMERS_VIEW,
    AdminPermission.CUSTOMERS_MANAGE,
    AdminPermission.VENDORS_VIEW,
    AdminPermission.VENDORS_MANAGE,
    AdminPermission.DRIVERS_VIEW,
    AdminPermission.DRIVERS_MANAGE,
    AdminPermission.BOOKINGS_VIEW,
    AdminPermission.BOOKINGS_MANAGE,
    AdminPermission.NOTIFICATIONS_VIEW,
    AdminPermission.REPORTS_VIEW,
  ],
  [AdminRole.FINANCE_ADMIN]: [
    AdminPermission.DASHBOARD_VIEW,
    AdminPermission.FINANCE_VIEW,
    AdminPermission.FINANCE_MANAGE,
    AdminPermission.REPORTS_VIEW,
    AdminPermission.SUBSCRIPTIONS_VIEW,
    AdminPermission.SUBSCRIPTIONS_MANAGE,
    AdminPermission.BOOKINGS_VIEW,
  ],
  [AdminRole.VERIFICATION_ADMIN]: [
    AdminPermission.DASHBOARD_VIEW,
    AdminPermission.VENDORS_VIEW,
    AdminPermission.VENDORS_APPROVE,
    AdminPermission.DRIVERS_VIEW,
    AdminPermission.DRIVERS_APPROVE,
    AdminPermission.NOTIFICATIONS_VIEW,
  ],
  [AdminRole.SUPPORT_ADMIN]: [
    AdminPermission.DASHBOARD_VIEW,
    AdminPermission.CUSTOMERS_VIEW,
    AdminPermission.BOOKINGS_VIEW,
    AdminPermission.BOOKINGS_MANAGE,
    AdminPermission.NOTIFICATIONS_VIEW,
  ],
};

export function getPermissionsForRole(role: AdminRole): AdminPermission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function hasPermission(
  permissions: string[],
  required: AdminPermission | AdminPermission[],
): boolean {
  const requiredList = Array.isArray(required) ? required : [required];
  return requiredList.every((p) => permissions.includes(p));
}
