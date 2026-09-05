import { z } from 'zod';

import { isValidIndianMobile, normalizeMobileNumber } from '../../utils/src/otp';
import { USER_ROLES, type UserRole } from '../../auth/src/roles';

const mobileField = z
  .string()
  .min(10)
  .refine(isValidIndianMobile, 'Invalid Indian mobile number');

const otpField = z.string().regex(/^\d{6}$/, 'OTP must be 6 digits');

const roleField = z.enum(USER_ROLES);

export const sendOtpSchema = z.object({
  mobileNumber: mobileField,
  role: roleField.default('customer'),
});

export const verifyOtpSchema = z.object({
  mobileNumber: mobileField,
  otp: otpField,
  role: roleField.default('customer'),
});

export const driverCredentialLoginSchema = z.object({
  loginId: z
    .string()
    .min(4)
    .max(40)
    .regex(/^[a-zA-Z0-9._-]+$/, 'Invalid login ID'),
  password: z.string().min(6).max(72),
});

export type SendOtpDto = z.infer<typeof sendOtpSchema>;
export type VerifyOtpDto = z.infer<typeof verifyOtpSchema>;
export type DriverCredentialLoginDto = z.infer<typeof driverCredentialLoginSchema>;

export function normalizeSendOtpDto(dto: SendOtpDto): {
  mobileNumber: string;
  role: UserRole;
} {
  return {
    mobileNumber: normalizeMobileNumber(dto.mobileNumber),
    role: dto.role ?? 'customer',
  };
}

export function normalizeVerifyOtpDto(dto: VerifyOtpDto): {
  mobileNumber: string;
  otp: string;
  role: UserRole;
} {
  return {
    mobileNumber: normalizeMobileNumber(dto.mobileNumber),
    otp: dto.otp,
    role: dto.role ?? 'customer',
  };
}
