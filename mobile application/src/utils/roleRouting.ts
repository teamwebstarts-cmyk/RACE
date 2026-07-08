import type { AuthUser } from '../types/auth';

export type UserRole = 'customer' | 'vendor' | 'driver';

export function isVendorRole(user: AuthUser | null | undefined): boolean {
  return user?.role === 'vendor';
}

/** Approved partners use the partner app unless they explicitly switch to customer mode. */
export function shouldUsePartnerExperience(
  user: AuthUser | null | undefined,
  useCustomerExperience: boolean,
): boolean {
  return isVendorRole(user) && !useCustomerExperience;
}

export function canAccessPartnerExperience(user: AuthUser | null | undefined): boolean {
  return isVendorRole(user);
}
