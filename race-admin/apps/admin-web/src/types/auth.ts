import { z } from 'zod';

const identifierSchema = z
  .string()
  .min(1, 'Email or mobile number is required')
  .refine(
    (value) => {
      const emailOk = z.string().email().safeParse(value).success;
      const mobileOk = /^\+?[\d\s-]{10,15}$/.test(value.replace(/\s/g, ''));
      return emailOk || mobileOk;
    },
    { message: 'Enter a valid email or mobile number' },
  );

export const loginFormSchema = z.object({
  identifier: identifierSchema,
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export type LoginStatus = 'idle' | 'loading' | 'success' | 'error';

export interface LoginError {
  message: string;
}
