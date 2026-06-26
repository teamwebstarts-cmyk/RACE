import { AppError, UnauthorizedError } from '../utils/errors';
import {
  generateTokenPair,
  isRefreshTokenValid,
  revokeRefreshToken,
  verifyRefreshToken,
} from '../auth/jwt';
import { userRepository } from '../repositories/user';
import { computeProfileCompleted } from '../utils/user';
import { otpService } from './otp';
import type { SendOtpDto, VerifyOtpDto, RefreshTokenDto } from '../auth/validators';
import { normalizeSendOtpDto, normalizeVerifyOtpDto } from '../auth/validators';

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: {
    id: string;
    mobileNumber: string;
    role: string;
    isVerified: boolean;
    isProfileCompleted: boolean;
    fullName?: string;
  };
  onboardingRequired: boolean;
}

export class AuthService {
  async sendOtp(dto: SendOtpDto) {
    const mobileNumber = normalizeSendOtpDto(dto);
    const user = await userRepository.findByMobile(mobileNumber);
    const otpResult = await otpService.sendOtp(mobileNumber);

    const profileCompleted = user ? computeProfileCompleted(user) : false;

    return {
      ...otpResult,
      isExistingUser: Boolean(user),
      isProfileCompleted: profileCompleted,
    };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<AuthTokensResponse> {
    const { mobileNumber, otp } = normalizeVerifyOtpDto(dto);
    const isValid = await otpService.verifyOtp(mobileNumber, otp);

    if (!isValid) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    let user = await userRepository.findByMobile(mobileNumber);
    let onboardingRequired = false;

    if (!user) {
      user = await userRepository.create({
        mobileNumber,
        isVerified: true,
        role: 'customer',
      });
      onboardingRequired = true;
    } else {
      if (!user.isVerified) {
        user.isVerified = true;
      }

      const profileCompleted = computeProfileCompleted(user);
      if (user.isProfileCompleted !== profileCompleted) {
        user.isProfileCompleted = profileCompleted;
      }

      await user.save();
      onboardingRequired = !user.isProfileCompleted;
    }

    if (!user) {
      throw new AppError('Unable to authenticate user', 500);
    }

    const tokens = await generateTokenPair(user.id, user.role, user.mobileNumber);

    return {
      ...tokens,
      user: {
        id: user.id,
        mobileNumber: user.mobileNumber,
        role: user.role,
        isVerified: user.isVerified,
        isProfileCompleted: user.isProfileCompleted,
        fullName: user.fullName,
      },
      onboardingRequired,
    };
  }

  async refreshToken(dto: RefreshTokenDto): Promise<AuthTokensResponse> {
    let payload;
    try {
      payload = verifyRefreshToken(dto.refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const valid = await isRefreshTokenValid(payload.sub, payload.jti);
    if (!valid) {
      throw new UnauthorizedError('Refresh token expired or revoked');
    }

    const user = await userRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    await revokeRefreshToken(payload.sub, payload.jti);
    const tokens = await generateTokenPair(user.id, user.role, user.mobileNumber);

    return {
      ...tokens,
      user: {
        id: user.id,
        mobileNumber: user.mobileNumber,
        role: user.role,
        isVerified: user.isVerified,
        isProfileCompleted: user.isProfileCompleted,
        fullName: user.fullName,
      },
      onboardingRequired: !computeProfileCompleted(user),
    };
  }
}

export const authService = new AuthService();
