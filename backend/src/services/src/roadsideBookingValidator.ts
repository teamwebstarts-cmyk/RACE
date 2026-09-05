import { z } from 'zod';

const locationSchema = z.object({
  address: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
});

const TOWING_SERVICE_TYPES = new Set([
  'towing',
  'towing_instant',
  'towing_scheduled',
  'towing_emergency',
]);

export const createRoadsideBookingSchema = z
  .object({
    serviceType: z.string().min(1),
    vehicleId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid vehicle id'),
    pickup: locationSchema,
    dropoff: locationSchema.optional(),
    scheduledAt: z.string().datetime().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.scheduledAt && new Date(data.scheduledAt) <= new Date()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'scheduledAt must be a future date',
        path: ['scheduledAt'],
      });
    }

    const normalizedType = data.serviceType.trim().toLowerCase();
    if (TOWING_SERVICE_TYPES.has(normalizedType) && !data.dropoff) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'dropoff is required for towing services',
        path: ['dropoff'],
      });
    }
  });

export type CreateRoadsideBookingDto = z.infer<typeof createRoadsideBookingSchema>;

export interface RoadsideAvailabilityItem {
  serviceType: string;
  label: string;
  available: boolean;
}
