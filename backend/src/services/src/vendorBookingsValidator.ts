import { z } from 'zod';

export const vendorAssignBookingSchema = z.object({
  bookingType: z.enum(['towing', 'driver']),
  driverId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid driver id'),
  vehicleId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid vehicle id').optional(),
});

export type VendorAssignBookingDto = z.infer<typeof vendorAssignBookingSchema>;
