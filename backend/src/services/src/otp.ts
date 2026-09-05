import { env } from '../../config/env';
import { AppError, TooManyRequestsError } from '../../utils/src/errors';
import { generateOtp } from '../../utils/src/otp';
import { sendSms } from '../../utils/src/sms';
import { authRepository } from './authRepository';

export class OtpService {
  private getExpiryDate(): Date {
    return new Date(Date.now() + env.OTP_EXPIRY_SECONDS * 1000);
  }

  private async assertResendAllowed(mobileNumber: string): Promise<void> {
    if (env.NODE_ENV !== 'production') {
      return;
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const resendCount = await authRepository.countRecentOtpSends(mobileNumber, oneHourAgo);

    if (resendCount >= env.OTP_MAX_RESEND_ATTEMPTS) {
      throw new TooManyRequestsError('Maximum OTP resend attempts exceeded');
    }
  }

  async sendOtp(mobileNumber: string): Promise<{ message: string; expiresIn: number; devOtp?: string }> {
    await this.assertResendAllowed(mobileNumber);
    await authRepository.invalidatePendingOtps(mobileNumber);

    // Always generate a real OTP for customer + partner (MVP / all environments).
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

    await sendSms(mobileNumber, mobileOtp);

    return {
      message: 'OTP sent to your mobile number',
      expiresIn: env.OTP_EXPIRY_SECONDS,
      // In non-production environments (or when Twilio is not configured), include
      // the OTP in the response so the mobile/web UI can show it as a toast.
      ...(env.NODE_ENV !== 'production' ? { devOtp: mobileOtp } : {}),
    };
  }

  async verifyOtp(mobileNumber: string, otp: string): Promise<void> {
    const log = await authRepository.findLatestValidOtpLog(mobileNumber);

    if (!log) {
      const alreadyUsed = await authRepository.findRecentlyVerifiedOtpLog(
        mobileNumber,
        otp,
        env.OTP_EXPIRY_SECONDS * 1000,
      );
      if (alreadyUsed) {
        return;
      }

      throw new AppError('OTP expired or already used. Tap Resend OTP for a new code.', 400);
    }

    if (!log.mobileOtpExpiry || log.mobileOtpExpiry <= new Date()) {
      throw new AppError('OTP expired. Tap Resend OTP for a new code.', 400);
    }

    if (env.NODE_ENV === 'production' && log.mobileAttempts >= env.OTP_MAX_VERIFY_ATTEMPTS) {
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
