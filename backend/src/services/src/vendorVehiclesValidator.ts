import { z } from 'zod';

const optionalDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}/, 'Use YYYY-MM-DD date')
  .optional();

export const createVendorVehicleSchema = z.object({
  registrationNo: z.string().min(4).max(20),
  type: z.string().min(2).max(80),
  model: z.string().min(1).max(80),
  year: z.coerce.number().int().min(1980).max(2100).optional(),
  status: z.enum(['ACTIVE', 'UNDER_MAINTENANCE', 'INACTIVE']).optional(),
  insuranceExpiry: optionalDateString,
  insuranceProvider: z.string().min(2).max(80).optional(),
  insurancePolicyNumber: z.string().min(2).max(80).optional(),
  rcNumber: z.string().min(2).max(40).optional(),
});

export const updateVendorVehicleSchema = z.object({
  type: z.string().min(2).max(80).optional(),
  model: z.string().min(1).max(80).optional(),
  year: z.coerce.number().int().min(1980).max(2100).optional(),
  status: z.enum(['ACTIVE', 'UNDER_MAINTENANCE', 'INACTIVE']).optional(),
  insuranceExpiry: optionalDateString,
  maintenanceNote: z.string().max(500).optional(),
});

export type CreateVendorVehicleDto = z.infer<typeof createVendorVehicleSchema>;
export type UpdateVendorVehicleDto = z.infer<typeof updateVendorVehicleSchema>;
