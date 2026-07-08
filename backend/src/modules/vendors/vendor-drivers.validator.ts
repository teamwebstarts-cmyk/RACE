import { z } from 'zod';

export const createVendorDriverSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(10).max(15),
  licenseNo: z.string().min(4).max(40),
  driverType: z.enum(['Tow Driver', 'Full-Time', 'Part-Time']).default('Tow Driver'),
  city: z.string().min(2).max(100).optional(),
  vehicleRegistration: z.string().min(4).max(20).optional(),
  email: z.string().email().optional(),
});

export const claimVendorDriverSchema = z.object({
  phone: z.string().min(10).max(15),
});

export const uploadVendorDriverDocumentSchema = z.object({
  documentType: z.string().min(2).max(50),
});

export type CreateVendorDriverDto = z.infer<typeof createVendorDriverSchema>;
export type ClaimVendorDriverDto = z.infer<typeof claimVendorDriverSchema>;
export type UploadVendorDriverDocumentDto = z.infer<typeof uploadVendorDriverDocumentSchema>;
