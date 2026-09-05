import { z } from 'zod';

export const createPaymentMethodSchema = z.object({
  type: z.enum(['upi', 'card', 'wallet', 'netbanking']),
  label: z.string().min(1),
  details: z.string().min(1),
  isDefault: z.boolean().optional(),
});

export type CreatePaymentMethodDto = z.infer<typeof createPaymentMethodSchema>;

export interface PaymentMethodResponseDto {
  id: string;
  type: string;
  label: string;
  details: string;
  isDefault: boolean;
  createdAt: string;
}

export interface WalletResponseDto {
  balance: number;
  currency: string;
  lastTopUpAt?: string;
}
