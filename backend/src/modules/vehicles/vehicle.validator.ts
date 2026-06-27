import { z } from 'zod';

export const createVehicleSchema = z.object({
  vehicleType: z.enum(['car', 'bike', 'ev', 'truck', 'auto', 'bus', 'other']),
  vehicleNumber: z.string().min(4).max(20),
  brand: z.string().min(1).max(50),
  model: z.string().min(1).max(50),
  color: z.string().max(30).optional(),
  fuelType: z.enum(['petrol', 'diesel', 'cng', 'electric', 'hybrid', 'other']),
  photo: z.string().url().optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial();

export const vehicleIdSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid vehicle id'),
});

export type CreateVehicleDto = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleDto = z.infer<typeof updateVehicleSchema>;

export interface VehicleResponseDto {
  id: string;
  customerId: string;
  vehicleType: string;
  vehicleNumber: string;
  brand: string;
  model: string;
  color?: string;
  fuelType: string;
  qrCode: string;
  photo?: string;
  createdAt: string;
  updatedAt: string;
}
