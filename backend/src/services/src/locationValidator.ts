import { z } from 'zod';

export const createLocationSchema = z.object({
  label: z.string().min(1),
  type: z.enum(['home', 'work', 'other']).default('other'),
  address: z.string().min(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isDefault: z.boolean().optional(),
});

export const updateLocationSchema = createLocationSchema.partial();

export type CreateLocationDto = z.infer<typeof createLocationSchema>;
export type UpdateLocationDto = z.infer<typeof updateLocationSchema>;

export interface LocationResponseDto {
  id: string;
  label: string;
  type: string;
  address: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  createdAt: string;
}
