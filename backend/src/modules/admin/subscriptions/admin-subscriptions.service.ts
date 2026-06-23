import { Types } from 'mongoose';

import {
  SubscriptionPlanModel,
  UserSubscriptionModel,
} from '../../subscriptions/subscription.model';
import { paginate } from '../shared/pagination';

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
    if (filters.tab === 'VENDOR') query.category = 'driver';
    if (filters.tab === 'CUSTOMER') query.category = 'towing';

    const subscriberCounts = await UserSubscriptionModel.aggregate<{ _id: Types.ObjectId; count: number }>([
      { $match: { status: 'active' } },
      { $group: { _id: '$planId', count: { $sum: 1 } } },
    ]);
    const countByPlan = new Map(subscriberCounts.map((row) => [row._id.toString(), row.count]));

    return paginate(SubscriptionPlanModel, query, filters, (doc) => {
      const activeSubscriptions = countByPlan.get(doc._id.toString()) ?? 0;
      const tab = doc.category === 'towing' ? 'CUSTOMER' : 'VENDOR';
      const cycleLabel = doc.billingCycle === 'monthly' ? '/mo' : '/yr';

      return {
        id: doc._id.toString(),
        planName: doc.name,
        type: tab === 'CUSTOMER' ? 'Customer' : 'Vendor',
        activeSubscriptions,
        price: doc.price,
        priceLabel: `₹${doc.price.toLocaleString('en-IN')}${cycleLabel}`,
        revenue: activeSubscriptions * doc.price,
        status: doc.isActive ? 'ACTIVE' : 'INACTIVE',
        tab,
      };
    });
  },
};
