import type { IUser } from './user.model';

export function computeProfileCompleted(user: Pick<
  IUser,
  'fullName' | 'email' | 'gender' | 'emergencyContact'
>): boolean {
  return Boolean(
    user.fullName &&
      user.email &&
      user.gender &&
      user.emergencyContact?.name &&
      user.emergencyContact?.mobileNumber,
  );
}
