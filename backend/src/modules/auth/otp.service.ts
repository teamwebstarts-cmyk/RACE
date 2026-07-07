import { env } from '../../config/env';
import { AppError, TooManyRequestsError } from '../../shared/utils/errors';
import { generateOtp } from '../../shared/utils/otp';
import { sendSms } from '../../utils/sms';
import { authRepository } from './auth.repository';

export class OtpService {
  private getExpiryDate(): Date {
    return new Date(Date.now() + env.OTP_EXPIRY_SECONDS * 1000);
  }

  private async assertResendAllowed(mobileNumber: string): Promise<void> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const resendCount = await authRepository.countRecentOtpSends(mobileNumber, oneHourAgo);

    if (resendCount >= env.OTP_MAX_RESEND_ATTEMPTS) {
      throw new TooManyRequestsError('Maximum OTP resend attempts exceeded');
    }
  }

  private async dispatchSms(mobileNumber: string, otp: string): Promise<void> {
    await sendSms(mobileNumber, otp);
  }

  async sendOtp(mobileNumber: string): Promise<{ message: string; expiresIn: number }> {
    await this.assertResendAllowed(mobileNumber);
    await authRepository.invalidatePendingOtps(mobileNumber);

    const mobileOtp = generateOtp();
    const expiry = this.getExpiryDate();

    await authRepository.createOtpLog({
      mobileNumber,
      mobileOtp,
      mobileOtpExpiry: expiry,
      mobileVerified: false,
      emailVerified: false,
      mobileAttempts: 0,
      emailAttempts: 0,
    });

    await this.dispatchSms(mobileNumber, mobileOtp);

    return {
      message: 'OTP sent',
      expiresIn: env.OTP_EXPIRY_SECONDS,
    };
  }

  async verifyOtp(mobileNumber: string, otp: string): Promise<void> {
    const log = await authRepository.findLatestValidOtpLog(mobileNumber);

    if (!log || !log.mobileOtpExpiry || log.mobileOtpExpiry <= new Date()) {
      throw new AppError('OTP expired', 400);
    }

    if (log.mobileAttempts >= env.OTP_MAX_VERIFY_ATTEMPTS) {
      throw new TooManyRequestsError('Maximum OTP verification attempts exceeded');
    }

    if (!log.mobileOtp || log.mobileOtp !== otp) {
      log.mobileAttempts += 1;
      await log.save();
      throw new AppError('Invalid OTP', 400);
    }

    log.mobileVerified = true;
    await log.save();
  }
}

export const otpService = new OtpService();
