import type { Request, Response } from 'express';

import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { sendSuccess } from '../../../shared/utils/apiResponse';
import { adminUsersService, adminActivityService } from '../admins/admin-users.service';
import { routeParam } from '../shared/route-param';
import { getAdminActor } from '../utils/request.utils';

export const adminUsersController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminUsersService.list(req.query as never));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminUsersService.create(req.body, getAdminActor(req)), 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminUsersService.update(routeParam(req.params.id), req.body, getAdminActor(req)));
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await adminUsersService.remove(routeParam(req.params.id), getAdminActor(req));
    sendSuccess(res, { message: 'Deleted' });
  }),
};

export const adminActivityController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminActivityService.list(req.query as never));
  }),
};
