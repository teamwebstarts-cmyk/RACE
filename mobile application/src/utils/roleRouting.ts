import type { AuthUser } from '../types/auth';

export type UserRole = 'customer' | 'vendor' | 'driver';

export function isVendorRole(user: AuthUser | null | undefined): boolean {
  return user?.role === 'vendor';
}

export function isDriverRole(user: AuthUser | null | undefined): boolean {
  return user?.role === 'driver';
}

/** Drivers + vendors use the partner app unless they switch to customer mode. */
export function shouldUsePartnerExperience(
  user: AuthUser | null | undefined,
  useCustomerExperience: boolean,
): boolean {
  return (isVendorRole(user) || isDriverRole(user)) && !useCustomerExperience;
}

export function canAccessPartnerExperience(user: AuthUser | null | undefined): boolean {
  return isVendorRole(user) || isDriverRole(user);
}
