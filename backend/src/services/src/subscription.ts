import { ConflictError, NotFoundError } from '../../utils/src/errors';
import { notificationService } from './notification';
import {
  SubscriptionPlanModel,
  UserSubscriptionModel,
  type ISubscriptionPlan,
  type IUserSubscription,
} from '../../models/src/subscription';
import type {
  PlanResponseDto,
  SubscribeDto,
  UserSubscriptionResponseDto,
} from './subscriptionValidator';

const DEFAULT_PLANS = [
  {
    slug: 'towing_basic_monthly',
    name: 'Basic',
    category: 'towing' as const,
    price: 299,
    billingCycle: 'monthly' as const,
    features: [
      { text: '2 Towing requests/month', included: true },
      { text: '30 min response time', included: true },
      { text: 'Standard support', included: true },
      { text: 'Priority dispatch', included: false },
      { text: 'Free roadside assistance', included: false },
    ],
    isMostPopular: false,
    actionType: 'purchase' as const,
  },
  {
    slug: 'towing_premium_monthly',
    name: 'Premium',
    category: 'towing' as const,
    price: 599,
    billingCycle: 'monthly' as const,
    features: [
      { text: '5 Towing requests/month', included: true },
      { text: 'Priority 15 min response', included: true },
      { text: '24/7 Priority support', included: true },
      { text: 'Free roadside assistance', included: true },
      { text: 'Family coverage', included: false },
    ],
    isMostPopular: true,
    actionType: 'purchase' as const,
  },
  {
    slug: 'towing_family_monthly',
    name: 'Family',
    category: 'towing' as const,
    price: 999,
    billingCycle: 'monthly' as const,
    features: [
      { text: 'Unlimited towing requests', included: true },
      { text: 'Up to 4 family vehicles', included: true },
      { text: 'Priority 10 min response', included: true },
      { text: '24/7 VIP support', included: true },
      { text: 'Free roadside assistance', included: true },
    ],
    isMostPopular: false,
    actionType: 'purchase' as const,
  },
  {
    slug: 'driver_monthly',
    name: 'Monthly Driver',
    category: 'driver' as const,
    price: 1499,
    billingCycle: 'monthly' as const,
    features: [
      { text: 'Up to 4 hours/day', included: true },
      { text: 'Professional & verified drivers', included: true },
      { text: '24/7 customer support', included: true },
    ],
    isMostPopular: false,
    actionType: 'purchase' as const,
  },
  {
    slug: 'driver_corporate_monthly',
    name: 'Corporate',
    category: 'driver' as const,
    price: 4999,
    billingCycle: 'monthly' as const,
    features: [
      { text: 'Dedicated account manager', included: true },
      { text: 'Priority booking & support', included: true },
      { text: 'Custom billing & invoicing', included: true },
    ],
    isMostPopular: false,
    actionType: 'contact' as const,
  },
];

function mapPlan(plan: ISubscriptionPlan): PlanResponseDto {
  return {
    id: plan.id,
    slug: plan.slug,
    name: plan.name,
    category: plan.category,
    price: plan.price,
    currency: plan.currency,
    billingCycle: plan.billingCycle,
    features: plan.features,
    isMostPopular: plan.isMostPopular,
    actionType: plan.actionType,
  };
}

function mapUserSub(sub: IUserSubscription): UserSubscriptionResponseDto {
  return {
    id: sub.id,
    planSlug: sub.planSlug,
    planName: sub.planName,
    category: sub.category,
    billingCycle: sub.billingCycle,
    price: sub.price,
    currency: sub.currency,
    status: sub.status,
    startedAt: sub.startedAt.toISOString(),
    expiresAt: sub.expiresAt.toISOString(),
  };
}

export class SubscriptionService {
  async ensurePlansSeeded(): Promise<void> {
    const count = await SubscriptionPlanModel.countDocuments();
    if (count > 0) return;

    await SubscriptionPlanModel.insertMany(DEFAULT_PLANS);
  }

  async listPlans(billingCycle?: string): Promise<PlanResponseDto[]> {
    await this.ensurePlansSeeded();
    const filter: Record<string, unknown> = { isActive: true };
    if (billingCycle) {
      filter.billingCycle = billingCycle;
    }
    const plans = await SubscriptionPlanModel.find(filter).sort({ category: 1, price: 1 });
    return plans.map(mapPlan);
  }

  async getUserSubscription(userId: string): Promise<UserSubscriptionResponseDto | null> {
    const sub = await UserSubscriptionModel.findOne({
      userId,
      status: 'active',
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    return sub ? mapUserSub(sub) : null;
  }

  async subscribe(userId: string, dto: SubscribeDto): Promise<UserSubscriptionResponseDto> {
    await this.ensurePlansSeeded();

    const existing = await this.getUserSubscription(userId);
    if (existing) {
      throw new ConflictError('You already have an active subscription');
    }

    const plan = await SubscriptionPlanModel.findOne({
      slug: dto.planSlug,
      isActive: true,
    });

    if (!plan) {
      throw new NotFoundError('Plan not found');
    }

    if (plan.actionType === 'contact') {
      throw new ConflictError('Please contact support for corporate plans');
    }

    const billingCycle = dto.billingCycle ?? plan.billingCycle;
    const price =
      billingCycle === 'yearly' ? Math.round(plan.price * 12 * 0.8) : plan.price;

    const startedAt = new Date();
    const expiresAt = new Date(startedAt);
    if (billingCycle === 'yearly') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    const sub = await UserSubscriptionModel.create({
      userId,
      planId: plan.id,
      planSlug: plan.slug,
      planName: plan.name,
      category: plan.category,
      billingCycle,
      price,
      currency: plan.currency,
      status: 'active',
      startedAt,
      expiresAt,
    });

    await notificationService.createForUser(userId, {
      type: 'SUBSCRIPTION',
      title: 'Subscription Activated',
      message: `Your ${plan.name} plan is now active until ${expiresAt.toLocaleDateString()}.`,
      metadata: { planSlug: plan.slug },
    });

    return mapUserSub(sub);
  }

  async cancel(userId: string): Promise<UserSubscriptionResponseDto> {
    const sub = await UserSubscriptionModel.findOne({
      userId,
      status: 'active',
    });

    if (!sub) {
      throw new NotFoundError('No active subscription found');
    }

    sub.status = 'cancelled';
    sub.cancelledAt = new Date();
    await sub.save();

    return mapUserSub(sub);
  }
}

export const subscriptionService = new SubscriptionService();
