import type { Request, Response } from 'express';

import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/apiResponse';
import { getAuthUser } from '../../shared/utils/request';
import { subscriptionService } from './subscription.service';

export class SubscriptionController {
  listPlans = asyncHandler(async (req: Request, res: Response) => {
    const billingCycle = req.query.billingCycle as string | undefined;
    const plans = await subscriptionService.listPlans(billingCycle);
    return sendSuccess(res, plans);
  });

  getCurrent = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const subscription = await subscriptionService.getUserSubscription(user.id);
    return sendSuccess(res, subscription);
  });

  subscribe = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const subscription = await subscriptionService.subscribe(user.id, req.body);
    return sendSuccess(res, subscription, 201);
  });

  cancel = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const subscription = await subscriptionService.cancel(user.id);
    return sendSuccess(res, subscription);
  });
}

export const subscriptionController = new SubscriptionController();
