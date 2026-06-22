import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
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
