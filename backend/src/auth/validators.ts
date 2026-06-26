import { z } from 'zod';

import { isValidIndianMobile, normalizeMobileNumber } from '../utils/otp';

export const sendOtpSchema = z.object({
  mobileNumber: z
    .string()
    .min(10)
    .refine(isValidIndianMobile, 'Invalid Indian mobile number'),
});

export const verifyOtpSchema = z.object({
  mobileNumber: z
    .string()
    .min(10)
    .refine(isValidIndianMobile, 'Invalid Indian mobile number'),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export type SendOtpDto = z.infer<typeof sendOtpSchema>;
export type VerifyOtpDto = z.infer<typeof verifyOtpSchema>;
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;

export function normalizeSendOtpDto(dto: SendOtpDto): string {
  return normalizeMobileNumber(dto.mobileNumber);
}

export function normalizeVerifyOtpDto(dto: VerifyOtpDto): { mobileNumber: string; otp: string } {
  return {
    mobileNumber: normalizeMobileNumber(dto.mobileNumber),
    otp: dto.otp,
  };
}
