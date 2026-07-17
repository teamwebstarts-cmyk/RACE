import { z } from 'zod';

export const vendorAssignBookingSchema = z.object({
  bookingType: z.enum(['towing', 'driver']),
  driverId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid driver id'),
  vehicleId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid vehicle id').optional(),
});

export const vendorVerifyTripOtpSchema = z.object({
  bookingType: z.enum(['towing', 'driver']),
  tripOtp: z.string().regex(/^\d{4}$/, 'Enter 4-digit trip OTP'),
});

export type VendorAssignBookingDto = z.infer<typeof vendorAssignBookingSchema>;
export type VendorVerifyTripOtpDto = z.infer<typeof vendorVerifyTripOtpSchema>;
