import { z } from 'zod';

export const subscribeSchema = z.object({
  planSlug: z.string().min(1),
  billingCycle: z.enum(['monthly', 'yearly']).optional(),
});

export type SubscribeDto = z.infer<typeof subscribeSchema>;

export interface PlanResponseDto {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  billingCycle: string;
  features: { text: string; included: boolean }[];
  isMostPopular: boolean;
  actionType: string;
}

export interface UserSubscriptionResponseDto {
  id: string;
  planSlug: string;
  planName: string;
  category: string;
  billingCycle: string;
  price: number;
  currency: string;
  status: string;
  startedAt: string;
  expiresAt: string;
}
