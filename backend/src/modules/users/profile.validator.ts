import { z } from 'zod';

const emergencyContactSchema = z.object({
  name: z.string().min(2).max(100),
  mobileNumber: z.string().min(10).max(15),
  relationship: z.string().max(50).optional(),
});

const addressSchema = z.object({
  line1: z.string().min(3).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
  country: z.string().default('India'),
});

export const completeProfileSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
    .optional(),
  emergencyContact: emergencyContactSchema,
  address: addressSchema,
  profilePhoto: z.string().url().optional(),
});

export type CompleteProfileDto = z.infer<typeof completeProfileSchema>;

export const updateProfileSchema = completeProfileSchema;

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;

export interface ProfileResponseDto {
  id: string;
  mobileNumber: string;
  fullName?: string;
  email?: string;
  gender?: string;
  dateOfBirth?: string;
  emergencyContact?: {
    name: string;
    mobileNumber: string;
    relationship?: string;
  };
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  profilePhoto?: string;
  isVerified: boolean;
  isProfileCompleted: boolean;
  role: string;
}
