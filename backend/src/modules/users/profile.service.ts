import { NotFoundError } from '../../shared/utils/errors';
import { userRepository } from './user.repository';
import type { IUser } from './user.model';
import type { ProfileResponseDto, UpdateProfileDto, CompleteProfileDto } from './profile.validator';

function mapProfile(user: IUser): ProfileResponseDto {
  return {
    id: user.id,
    mobileNumber: user.mobileNumber,
    fullName: user.fullName,
    email: user.email,
    gender: user.gender,
    dateOfBirth: user.dateOfBirth?.toISOString().split('T')[0],
    emergencyContact: user.emergencyContact,
    address: user.address,
    profilePhoto: user.profilePhoto,
    isVerified: user.isVerified,
    isProfileCompleted: user.isProfileCompleted,
    role: user.role,
    ...(user.role === 'driver' ? { isAvailable: user.isAvailable ?? true } : {}),
  };
}

export class ProfileService {
  async getProfile(userId: string): Promise<ProfileResponseDto> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return mapProfile(user);
  }

  async completeProfile(userId: string, dto: CompleteProfileDto): Promise<ProfileResponseDto> {
    const user = await userRepository.updateById(userId, {
      fullName: dto.fullName,
      ...(dto.email ? { email: dto.email } : {}),
      gender: dto.gender,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      emergencyContact: dto.emergencyContact,
      address: dto.address,
      profilePhoto: dto.profilePhoto,
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return mapProfile(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<ProfileResponseDto> {
    const patch: Record<string, unknown> = {};

    if (dto.fullName !== undefined) patch.fullName = dto.fullName;
    if (dto.email !== undefined) patch.email = dto.email;
    if (dto.gender !== undefined) patch.gender = dto.gender;
    if (dto.dateOfBirth !== undefined) {
      patch.dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined;
    }
    if (dto.emergencyContact !== undefined) patch.emergencyContact = dto.emergencyContact;
    if (dto.address !== undefined) patch.address = dto.address;
    if (dto.profilePhoto !== undefined) patch.profilePhoto = dto.profilePhoto;

    const user = await userRepository.updateById(userId, patch);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return mapProfile(user);
  }
}

export const profileService = new ProfileService();
