import { UserModel, type IUser } from '../models/user';

export class UserRepository {
  async findByMobile(mobileNumber: string): Promise<IUser | null> {
    return UserModel.findOne({ mobileNumber }).exec();
  }

  async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id).exec();
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
