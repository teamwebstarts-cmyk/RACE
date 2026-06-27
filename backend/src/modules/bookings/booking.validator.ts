import { z } from 'zod';

const locationSchema = z.object({
  label: z.string().min(1),
  address: z.string().min(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const createBookingSchema = z.object({
  categoryId: z.string().min(1),
  serviceId: z.string().min(1),
  serviceLabel: z.string().min(1),
  serviceDescription: z.string().optional(),
  vehicleId: z.string().min(1),
  pickup: locationSchema,
  dropoff: locationSchema.optional(),
  scheduledAt: z.string().datetime().optional(),
  estimatedTotal: z.number().positive().optional(),
});

export const submitRatingSchema = z.object({
  rating: z.number().int().min(1).max(5),
  review: z.string().max(500).optional(),
  tipAmount: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
});

export type CreateBookingDto = z.infer<typeof createBookingSchema>;
export type SubmitRatingDto = z.infer<typeof submitRatingSchema>;

export interface BookingLocationDto {
  label: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

export interface BookingDriverDto {
  id: string;
  name: string;
  rating: number;
  phone: string;
  avatarUrl?: string;
  experience?: string;
  verified?: boolean;
}

export interface BookingTimelineDto {
  status: string;
  label: string;
  timestamp: string;
  completed: boolean;
}

export interface BookingInvoiceDto {
  baseFare: number;
  distanceCharge?: number;
  platformFee?: number;
  discount?: number;
  total: number;
  currency: string;
  paymentMethod?: string;
}

export interface BookingResponseDto {
  id: string;
  bookingNumber: string;
  categoryId: string;
  serviceId: string;
  serviceLabel: string;
  serviceDescription?: string;
  status: string;
  vehicleId: string;
  vehicleNumber: string;
  vehicleLabel?: string;
  pickup: BookingLocationDto;
  dropoff?: BookingLocationDto;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
  driver?: BookingDriverDto;
  etaMinutes?: number;
  distanceKm?: number;
  durationMinutes?: number;
  invoice?: BookingInvoiceDto;
  timeline: BookingTimelineDto[];
  rating?: number;
  review?: string;
}

export interface TrackingResponseDto {
  bookingId: string;
  status: string;
  etaMinutes: number;
  driver?: BookingDriverDto;
  driverLocation?: { latitude: number; longitude: number };
  pickup: BookingLocationDto;
  dropoff?: BookingLocationDto;
}
