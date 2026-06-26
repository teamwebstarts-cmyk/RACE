import type { Request, Response } from 'express';

import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { sendSuccess } from '../../../shared/utils/apiResponse';
import { adminBookingsService } from '../bookings/admin-bookings.service';
import { routeParam } from '../shared/route-param';
import { getAdminActor } from '../utils/request.utils';

export const adminBookingsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminBookingsService.list(req.query as never));
  }),

  getCounts: asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, await adminBookingsService.getCounts());
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminBookingsService.getById(routeParam(req.params.id)));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminBookingsService.create(req.body, getAdminActor(req)), 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminBookingsService.update(routeParam(req.params.id), req.body, getAdminActor(req)));
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await adminBookingsService.remove(routeParam(req.params.id), getAdminActor(req));
    sendSuccess(res, { message: 'Deleted' });
  }),

  assignVendor: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminBookingsService.assignVendor(
      routeParam(req.params.id),
      req.body.vendorId,
      getAdminActor(req),
    ));
  }),

  assignDriver: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminBookingsService.assignDriver(
      routeParam(req.params.id),
      req.body.driverId,
      getAdminActor(req),
    ));
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminBookingsService.updateStatus(
      routeParam(req.params.id),
      req.body.status,
      getAdminActor(req),
      { reason: req.body.reason, amount: req.body.amount },
    ));
  }),
};
