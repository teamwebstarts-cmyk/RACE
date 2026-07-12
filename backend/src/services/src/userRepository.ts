import { normalizeMobileNumber } from '../../utils/src/otp';
import { UserModel, type IUser } from '../../models/src/user';

function legacyMobileFormats(normalized: string): string[] {
  if (!normalized.startsWith('+91') || normalized.length !== 13) {
    return [normalized];
  }

  const digits10 = normalized.slice(3);
  return [normalized, digits10, `91${digits10}`];
}

export class UserRepository {
  async findByMobile(mobileNumber: string): Promise<IUser | null> {
    const normalized = normalizeMobileNumber(mobileNumber);
    const formats = legacyMobileFormats(normalized);

    const user = await UserModel.findOne({ mobileNumber: { $in: formats } }).exec();
    if (!user || user.mobileNumber === normalized) {
      return user;
    }

    user.mobileNumber = normalized;
    await user.save();
    return user;
  }

  async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email: email.trim().toLowerCase() }).exec();
  }

  async findByMobileOrEmail(mobileNumber: string, email: string): Promise<IUser | null> {
    const normalized = normalizeMobileNumber(mobileNumber);
    const formats = legacyMobileFormats(normalized);
    const normalizedEmail = email.trim().toLowerCase();

    return UserModel.findOne({
      $or: [{ mobileNumber: { $in: formats } }, { email: normalizedEmail }],
    }).exec();
  }

  async create(data: Partial<IUser>): Promise<IUser> {
    return UserModel.create(data);
  }

  async updateById(id: string, data: Partial<IUser>): Promise<IUser | null> {
    const user = await UserModel.findById(id).exec();
    if (!user) {
      return null;
    }

    Object.assign(user, data);
    await user.save();
    return user;
  }
}

export const userRepository = new UserRepository();
