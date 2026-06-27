import type { Request, Response } from 'express';

import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { sendSuccess } from '../../../shared/utils/apiResponse';
import { adminCustomersService } from '../customers/admin-customers.service';
import { routeParam } from '../shared/route-param';
import { getAdminActor } from '../utils/request.utils';

export const adminCustomersController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminCustomersService.list(req.query as never));
  }),

  getCities: asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, await adminCustomersService.getCities());
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminCustomersService.getById(routeParam(req.params.id)));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminCustomersService.create(req.body, getAdminActor(req)), 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminCustomersService.update(routeParam(req.params.id), req.body, getAdminActor(req)));
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await adminCustomersService.remove(routeParam(req.params.id), getAdminActor(req));
    sendSuccess(res, { message: 'Deleted' });
  }),

  setStatus: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminCustomersService.setStatus(
      routeParam(req.params.id),
      req.body.status,
      getAdminActor(req),
    ));
  }),

  exportCsv: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminCustomersService.export(req.query as never));
  }),
};
