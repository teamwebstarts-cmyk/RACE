import { z } from 'zod';

export const adminLoginSchema = z.object({
  identifier: z.string().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const adminRefreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const adminForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const adminResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
