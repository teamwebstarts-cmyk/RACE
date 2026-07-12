import { z } from 'zod';

import { BOOKING_PAYMENT_TYPES } from '../../models/src/paymentTransaction';
import { PAYMENT_TRANSACTION_STATUSES } from '../../models/src/paymentTransaction';

export const initiateBookingPaymentSchema = z.object({
  bookingId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid booking id'),
  bookingType: z.enum(BOOKING_PAYMENT_TYPES),
});

export const verifyBookingPaymentSchema = z.object({
  transactionId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid transaction id'),
  status: z.enum(PAYMENT_TRANSACTION_STATUSES),
});

export type InitiateBookingPaymentDto = z.infer<typeof initiateBookingPaymentSchema>;
export type VerifyBookingPaymentDto = z.infer<typeof verifyBookingPaymentSchema>;

export interface BookingPaymentSessionDto {
  transactionId: string;
  bookingId: string;
  bookingType: string;
  paymentType: 'advance' | 'final' | 'refund';
  amount: number;
  status: string;
  gatewayReferenceId: string;
  message: string;
}
