import type { IUser } from '../../models/src/user';

export function computeProfileCompleted(
  user: Pick<
    IUser,
    'role' | 'mobileNumber' | 'fullName' | 'email' | 'gender' | 'emergencyContact' | 'address' | 'vendorProfile' | 'driverProfile'
  >,
): boolean {
  if (user.role === 'vendor') {
    const profile = user.vendorProfile;
    return Boolean(
      user.fullName &&
        profile?.businessName &&
        profile?.ownerName &&
        user.mobileNumber &&
        (profile.address || user.address?.city),
    );
  }

  if (user.role === 'driver') {
    const profile = user.driverProfile;
    return Boolean(
      user.fullName &&
        user.mobileNumber &&
        profile?.licenseNo &&
        profile?.driverCode &&
        profile?.city,
    );
  }

  return Boolean(
    user.fullName &&
      user.gender &&
      user.emergencyContact?.name &&
      user.emergencyContact?.mobileNumber &&
      user.address?.line1 &&
      user.address?.city &&
      user.address?.state &&
      user.address?.pincode,
  );
}
