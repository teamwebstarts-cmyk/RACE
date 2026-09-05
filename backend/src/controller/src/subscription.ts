import type { Request, Response } from 'express';

import { asyncHandler } from '../../utils/src/asyncHandler';
import { sendSuccess } from '../../utils/src/apiResponse';
import { getAuthUser } from '../../utils/src/request';
import { subscriptionService } from '../../services/src/subscription';

export class SubscriptionController {
  listPlans = asyncHandler(async (req: Request, res: Response) => {
    const plans = await subscriptionService.listPlans({
      billingCycle: req.query.billingCycle as string | undefined,
      audience: req.query.audience as string | undefined,
      category: req.query.category as string | undefined,
    });
    return sendSuccess(res, plans);
  });

  getCurrent = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const audience = req.query.audience as string | undefined;
    const category = req.query.category as string | undefined;

    if (req.query.all === '1' || req.query.all === 'true') {
      const subscriptions = await subscriptionService.listUserSubscriptions(user.id);
      return sendSuccess(res, subscriptions);
    }

    const subscription = await subscriptionService.getUserSubscription(user.id, {
      audience,
      category,
    });
    return sendSuccess(res, subscription);
  });

  subscribe = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const subscription = await subscriptionService.subscribe(user.id, req.body);
    return sendSuccess(res, subscription, 201);
  });

  cancel = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const subscription = await subscriptionService.cancel(user.id, {
      category: req.body?.category,
    });
    return sendSuccess(res, subscription);
  });
}

export const subscriptionController = new SubscriptionController();
