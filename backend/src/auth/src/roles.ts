/** App user roles (unified User collection). */
export const USER_ROLES = ['customer', 'vendor', 'driver'] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** Admin panel roles (Admin collection + platform admin). */
export const ADMIN_ROLES = [
  'SUPER_ADMIN',
  'OPERATIONS_ADMIN',
  'FINANCE_ADMIN',
  'VERIFICATION_ADMIN',
  'SUPPORT_ADMIN',
] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];
