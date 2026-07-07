import { AppError, ForbiddenError, UnauthorizedError } from '../../shared/utils/errors';
import {
  generateTokenPair,
  isRefreshTokenValid,
  revokeRefreshToken,
  verifyRefreshToken,
} from '../../shared/utils/jwt';
import { userRepository } from '../users/user.repository';
import { computeProfileCompleted } from '../users/user.utils';
import type { IUser } from '../users/user.model';
import { otpService } from './otp.service';
import type { SendOtpDto, VerifyOtpDto } from './auth.validator';
import { normalizeSendOtpDto, normalizeVerifyOtpDto } from './auth.validator';
import type { RefreshTokenDto } from './auth.dto';

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
    email?: string;
  };
  onboardingRequired: boolean;
}

function assertAccountActive(accountStatus?: string): void {
  if (accountStatus === 'SUSPENDED') {
    throw new ForbiddenError('Your account has been suspended. Please contact support.');
  }
  if (accountStatus === 'INACTIVE') {
    throw new ForbiddenError('Your account is inactive. Please contact support.');
  }
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: number }).code === 11000
  );
}

async function createUnverifiedUser(mobileNumber: string): Promise<IUser> {
  try {
    return await userRepository.create({
      mobileNumber,
      isVerified: false,
      isProfileCompleted: false,
      role: 'customer',
    });
  } catch (error) {
    if (!isDuplicateKeyError(error)) {
      throw error;
    }

    const existing = await userRepository.findByMobile(mobileNumber);
    if (!existing) {
      throw error;
    }

    return existing;
  }
}

export class AuthService {
  async sendOtp(dto: SendOtpDto) {
    const { mobileNumber } = normalizeSendOtpDto(dto);
    const user = await userRepository.findByMobile(mobileNumber);

    // Returning user — verified (complete or incomplete profile)
    if (user?.isVerified) {
      assertAccountActive(user.accountStatus);
      const otpResult = await otpService.sendOtp(mobileNumber);

      return {
        ...otpResult,
        isExistingUser: true,
        isProfileCompleted: computeProfileCompleted(user),
      };
    }

    // Abandoned mid-flow — unverified record already exists
    if (user && !user.isVerified) {
      const otpResult = await otpService.sendOtp(mobileNumber);

      return {
        ...otpResult,
        isExistingUser: false,
        isProfileCompleted: false,
        onboardingRequired: true,
      };
    }

    // Brand new user — create minimal record before sending OTP
    await createUnverifiedUser(mobileNumber);
    const otpResult = await otpService.sendOtp(mobileNumber);

    return {
      ...otpResult,
      isExistingUser: false,
      isProfileCompleted: false,
      onboardingRequired: true,
    };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<AuthTokensResponse> {
    const { mobileNumber, otp } = normalizeVerifyOtpDto(dto);

    await otpService.verifyOtp(mobileNumber, otp);

    const user = await userRepository.findByMobile(mobileNumber);
    if (!user) {
      throw new AppError('Account not found. Please request OTP first.', 404);
    }

    assertAccountActive(user.accountStatus);

    user.isVerified = true;
    user.isProfileCompleted = computeProfileCompleted(user);
    await user.save();

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
        email: user.email,
      },
      onboardingRequired: !user.isProfileCompleted,
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

    assertAccountActive(user.accountStatus);

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
        email: user.email,
      },
      onboardingRequired: !computeProfileCompleted(user),
    };
  }
}

export const authService = new AuthService();
