import { Types } from 'mongoose';

import {
  SubscriptionPlanModel,
  UserSubscriptionModel,
} from '../../../models/src/subscription';
import { UserModel } from '../../../models/src/user';
import { paginate } from './pagination';
import { logActivity } from './activityLogger';
import { createNotification } from './notificationService';
import { generateSubscriptionRevenue } from './transactionEngine';
import { NotFoundError } from '../../../utils/src/errors';

export const adminSubscriptionsService = {
  async getOverview() {
    const [active, revenue, plans] = await Promise.all([
      UserSubscriptionModel.countDocuments({ status: 'active' }),
      UserSubscriptionModel.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: null, total: { $sum: '$price' } } },
      ]),
      SubscriptionPlanModel.countDocuments({ isActive: true }),
    ]);

    return {
      metrics: [
        { id: 'active', label: 'Active Subscriptions', value: active, icon: 'CreditCard' },
        { id: 'revenue', label: 'Monthly Revenue', value: revenue[0]?.total ?? 0, icon: 'IndianRupee' },
        { id: 'plans', label: 'Active Plans', value: plans, icon: 'Layers' },
      ],
    };
  },

  async listPlans(filters: { tab?: string; page?: number; pageSize?: number }) {
    const query: Record<string, unknown> = { isActive: true };
    if (filters.tab === 'VENDOR') query.audience = 'vendor';
    if (filters.tab === 'CUSTOMER') query.audience = 'customer';

    const subscriberCounts = await UserSubscriptionModel.aggregate<{ _id: Types.ObjectId; count: number }>([
      { $match: { status: 'active' } },
      { $group: { _id: '$planId', count: { $sum: 1 } } },
    ]);
    const countByPlan = new Map(subscriberCounts.map((row) => [row._id.toString(), row.count]));

    return paginate(SubscriptionPlanModel, query, filters, (doc) => {
      const activeSubscriptions = countByPlan.get(doc._id.toString()) ?? 0;
      const tab = doc.audience === 'vendor' ? 'VENDOR' : 'CUSTOMER';
      const cycleLabel = doc.billingCycle === 'monthly' ? '/mo' : '/yr';

      return {
        id: doc._id.toString(),
        planName: doc.name,
        type: tab === 'CUSTOMER' ? 'Customer' : 'Vendor',
        category: doc.category,
        activeSubscriptions,
        price: doc.price,
        priceLabel: `₹${doc.price.toLocaleString('en-IN')}${cycleLabel}`,
        revenue: activeSubscriptions * doc.price,
        status: doc.isActive ? 'ACTIVE' : 'INACTIVE',
        tab,
      };
    });
  },

  async createPlan(
    input: {
      name: string;
      slug: string;
      category: 'towing' | 'driver' | 'partner';
      audience?: 'customer' | 'vendor';
      price: number;
      billingCycle: 'monthly' | 'yearly';
      features?: { text: string; included: boolean }[];
    },
    actor: { id: string; name: string },
  ) {
    const audience =
      input.audience ??
      (input.category === 'partner' ? 'vendor' : 'customer');

    const plan = await SubscriptionPlanModel.create({
      ...input,
      audience,
      currency: 'INR',
      isActive: true,
      actionType: 'purchase',
      features: input.features ?? [],
    });

    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: 'SUBSCRIPTION_PLAN_CREATED',
      entityType: 'subscription',
      entityId: plan._id.toString(),
      title: `Plan ${plan.name} created`,
    });

    return plan;
  },

  async updatePlan(
    id: string,
    input: Partial<{
      name: string;
      price: number;
      isActive: boolean;
      features: { text: string; included: boolean }[];
    }>,
    actor: { id: string; name: string },
  ) {
    const plan = await SubscriptionPlanModel.findByIdAndUpdate(id, input, { new: true });
    if (!plan) throw new NotFoundError('Plan not found');

    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: 'SUBSCRIPTION_PLAN_UPDATED',
      entityType: 'subscription',
      entityId: id,
      title: `Plan ${plan.name} updated`,
    });

    return plan;
  },

  async assignSubscription(
    input: { userId: string; planId: string },
    actor: { id: string; name: string },
  ) {
    const [user, plan] = await Promise.all([
      UserModel.findById(input.userId),
      SubscriptionPlanModel.findById(input.planId),
    ]);
    if (!user) throw new NotFoundError('User not found');
    if (!plan) throw new NotFoundError('Plan not found');

    const startedAt = new Date();
    const expiresAt = new Date(
      startedAt.getTime() + (plan.billingCycle === 'monthly' ? 30 : 365) * 86400000,
    );

    const subscription = await UserSubscriptionModel.create({
      userId: user._id,
      planId: plan._id,
      planSlug: plan.slug,
      planName: plan.name,
      audience: plan.audience ?? (plan.category === 'partner' ? 'vendor' : 'customer'),
      category: plan.category,
      billingCycle: plan.billingCycle,
      price: plan.price,
      currency: plan.currency,
      status: 'active',
      startedAt,
      expiresAt,
    });

    await generateSubscriptionRevenue(subscription._id, user._id, plan.price, plan.name);

    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: 'SUBSCRIPTION_ASSIGNED',
      entityType: 'subscription',
      entityId: subscription._id.toString(),
      title: `${plan.name} assigned to ${user.fullName}`,
    });

    await createNotification({
      title: 'Subscription assigned',
      message: `${user.fullName} subscribed to ${plan.name}`,
      category: 'customer',
      entityType: 'subscription',
      entityId: subscription._id.toString(),
    });

    return subscription;
  },

  async cancelSubscription(id: string, actor: { id: string; name: string }) {
    const subscription = await UserSubscriptionModel.findByIdAndUpdate(
      id,
      { status: 'cancelled', cancelledAt: new Date() },
      { new: true },
    );
    if (!subscription) throw new NotFoundError('Subscription not found');

    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: 'SUBSCRIPTION_CANCELLED',
      entityType: 'subscription',
      entityId: id,
      title: `Subscription ${subscription.planName} cancelled`,
    });

    return subscription;
  },
};
