import { AdminPermission, AdminRole, getPermissionsForRole } from '../services/src/admin/rbac';
import { env } from './env';

/** Fixed platform admin identity — not stored in MongoDB. */
export const PLATFORM_ADMIN_ID = 'race-platform-admin';

export interface PlatformAdmin {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  permissions: string[];
  isActive: true;
}

export function getPlatformAdmin(): PlatformAdmin {
  return {
    id: PLATFORM_ADMIN_ID,
    name: env.ADMIN_NAME,
    email: env.ADMIN_EMAIL.toLowerCase(),
    role: AdminRole.SUPER_ADMIN,
    permissions: getPermissionsForRole(AdminRole.SUPER_ADMIN).map(String),
    isActive: true,
  };
}

export function verifyPlatformAdminCredentials(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === env.ADMIN_EMAIL.toLowerCase() &&
    password === env.ADMIN_PASSWORD
  );
}

export function isPlatformAdminId(id: string): boolean {
  return id === PLATFORM_ADMIN_ID;
}

export function getAllAdminPermissions(): string[] {
  return Object.values(AdminPermission).map(String);
}
