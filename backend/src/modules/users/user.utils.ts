import type { IUser } from './user.model';

export function computeProfileCompleted(
  user: Pick<
    IUser,
    'fullName' | 'email' | 'gender' | 'emergencyContact' | 'address'
  >,
): boolean {
  return Boolean(
    user.fullName &&
      user.email &&
      user.gender &&
      user.emergencyContact?.name &&
      user.emergencyContact?.mobileNumber &&
      user.address?.line1 &&
      user.address?.city &&
      user.address?.state &&
      user.address?.pincode,
  );
}
