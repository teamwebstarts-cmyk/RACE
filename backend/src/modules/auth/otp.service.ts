import { env } from '../../configs/env';
import { getCache } from '../../configs/cache';
import { TooManyRequestsError } from '../../shared/utils/errors';
import { generateOtp } from '../../shared/utils/otp';
import { logger } from '../../shared/utils/logger';
import { authRepository } from './auth.repository';

const OTP_KEY = (mobile: string) => `otp:${mobile}`;
const RESEND_KEY = (mobile: string) => `otp:resend:${mobile}`;
const VERIFY_KEY = (mobile: string) => `otp:verify:${mobile}`;

export class OtpService {
  async sendOtp(mobileNumber: string): Promise<{ message: string; expiresIn: number; devOtp?: string }> {
    const cache = getCache();

    const resendCount = Number((await cache.get(RESEND_KEY(mobileNumber))) ?? 0);
    if (resendCount >= env.OTP_MAX_RESEND_ATTEMPTS) {
      throw new TooManyRequestsError('Maximum OTP resend attempts exceeded');
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_SECONDS * 1000);

    await cache.set(OTP_KEY(mobileNumber), otp, 'EX', env.OTP_EXPIRY_SECONDS);
    await cache.set(VERIFY_KEY(mobileNumber), '0', 'EX', env.OTP_EXPIRY_SECONDS);
    const newResendCount = await cache.incr(RESEND_KEY(mobileNumber));
    if (newResendCount === 1) {
      await cache.set(RESEND_KEY(mobileNumber), String(newResendCount), 'EX', 60 * 60);
    }

    await authRepository.createOtpLog({
      mobileNumber,
      otp,
      status: 'pending',
      expiresAt,
      attempts: 0,
    });

    if (env.NODE_ENV !== 'production') {
      logger.info('OTP generated (dev only)', { mobileNumber, otp });
    }

    return {
      message: 'OTP sent successfully',
      expiresIn: env.OTP_EXPIRY_SECONDS,
      ...(env.NODE_ENV !== 'production' ? { devOtp: otp } : {}),
    };
  }

  async verifyOtp(mobileNumber: string, otp: string): Promise<boolean> {
    const cache = getCache();

    const attempts = Number((await cache.get(VERIFY_KEY(mobileNumber))) ?? 0);
    if (attempts >= env.OTP_MAX_VERIFY_ATTEMPTS) {
      throw new TooManyRequestsError('Maximum OTP verification attempts exceeded');
    }

    await cache.incr(VERIFY_KEY(mobileNumber));

    const storedOtp = await cache.get(OTP_KEY(mobileNumber));
    if (!storedOtp) {
      return false;
    }

    if (storedOtp !== otp) {
      const log = await authRepository.findLatestPendingOtp(mobileNumber);
      if (log) {
        await authRepository.updateOtpLog(log.id, {
          attempts: log.attempts + 1,
          status: log.attempts + 1 >= env.OTP_MAX_VERIFY_ATTEMPTS - 1 ? 'failed' : 'pending',
        });
      }
      return false;
    }

    await cache.del(OTP_KEY(mobileNumber), VERIFY_KEY(mobileNumber), RESEND_KEY(mobileNumber));

    const log = await authRepository.findLatestPendingOtp(mobileNumber);
    if (log) {
      await authRepository.updateOtpLog(log.id, { status: 'verified' });
    }

    return true;
  }
}

export const otpService = new OtpService();
