import { z } from 'zod';

export const assignServiceBookingDriverSchema = z.object({
  driverId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid driver id'),
  bookingType: z.enum(['towing', 'driver']),
});

export const cancelServiceBookingSchema = z.object({
  bookingType: z.enum(['towing', 'driver']),
  reason: z.string().trim().min(1, 'Reason is required').max(250),
  refundAmount: z.coerce.number().min(0).optional(),
});

export const availableDriversQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
});

export type AssignServiceBookingDriverDto = z.infer<typeof assignServiceBookingDriverSchema>;
export type CancelServiceBookingDto = z.infer<typeof cancelServiceBookingSchema>;
export type AvailableDriversQueryDto = z.infer<typeof availableDriversQuerySchema>;
