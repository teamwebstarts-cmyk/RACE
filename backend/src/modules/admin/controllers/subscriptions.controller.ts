import type { Request, Response } from 'express';

import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { sendSuccess } from '../../../shared/utils/apiResponse';
import { adminSubscriptionsService } from '../subscriptions/admin-subscriptions.service';
import { routeParam } from '../shared/route-param';
import { getAdminActor } from '../utils/request.utils';

export const adminSubscriptionsController = {
  getOverview: asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, await adminSubscriptionsService.getOverview());
  }),

  listPlans: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminSubscriptionsService.listPlans(req.query as never));
  }),

  createPlan: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminSubscriptionsService.createPlan(req.body, getAdminActor(req)), 201);
  }),

  updatePlan: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminSubscriptionsService.updatePlan(
      routeParam(req.params.id),
      req.body,
      getAdminActor(req),
    ));
  }),

  assignSubscription: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminSubscriptionsService.assignSubscription(req.body, getAdminActor(req)), 201);
  }),

  cancelSubscription: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminSubscriptionsService.cancelSubscription(routeParam(req.params.id), getAdminActor(req)));
  }),
};
