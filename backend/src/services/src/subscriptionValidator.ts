import { z } from 'zod';

export const subscribeSchema = z.object({
  planSlug: z.string().min(1),
  billingCycle: z.enum(['monthly', 'yearly']).optional(),
});

export const listPlansQuerySchema = z.object({
  billingCycle: z.enum(['monthly', 'yearly']).optional(),
  audience: z.enum(['customer', 'vendor']).optional(),
  category: z.enum(['towing', 'driver', 'partner']).optional(),
});

export const cancelSubscriptionSchema = z.object({
  category: z.enum(['towing', 'driver', 'partner']).optional(),
});

export type SubscribeDto = z.infer<typeof subscribeSchema>;

export interface PlanResponseDto {
  id: string;
  slug: string;
  name: string;
  audience: string;
  category: string;
  price: number;
  currency: string;
  billingCycle: string;
  features: { text: string; included: boolean }[];
  benefits?: {
    commissionRate?: number;
    priorityLeads: boolean;
    featuredListing: boolean;
    performanceBadge: boolean;
    reducedCommission: boolean;
  };
  isMostPopular: boolean;
  actionType: string;
}

export interface UserSubscriptionResponseDto {
  id: string;
  planSlug: string;
  planName: string;
  audience: string;
  category: string;
  billingCycle: string;
  price: number;
  currency: string;
  status: string;
  startedAt: string;
  expiresAt: string;
}
