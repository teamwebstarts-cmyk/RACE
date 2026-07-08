import { UserModel } from '../../users/user.model';

export interface AssignedDriverSummary {
  id: string;
  name: string;
  phone: string;
  rating: number;
}

export async function resolveAssignedDriver(
  driverId: string | undefined | null,
): Promise<AssignedDriverSummary | undefined> {
  if (!driverId) return undefined;

  const driver = await UserModel.findById(driverId)
    .select('fullName mobileNumber')
    .exec();

  if (!driver) return undefined;

  return {
    id: driver.id,
    name: driver.fullName?.trim() || 'RACE Driver',
    phone: driver.mobileNumber,
    rating: 4.8,
  };
}
