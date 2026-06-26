import type { Request, Response } from 'express';

import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { sendSuccess } from '../../../shared/utils/apiResponse';
import { adminNotificationsService } from '../notifications/admin-notifications.service';
import { routeParam } from '../shared/route-param';

export const adminNotificationsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminNotificationsService.list(req.query as never));
  }),

  getUnreadCount: asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, { count: await adminNotificationsService.getUnreadCount() });
  }),

  markRead: asyncHandler(async (req: Request, res: Response) => {
    await adminNotificationsService.markRead(routeParam(req.params.id));
    sendSuccess(res, { message: 'Marked read' });
  }),

  markAllRead: asyncHandler(async (_req: Request, res: Response) => {
    await adminNotificationsService.markAllRead();
    sendSuccess(res, { message: 'All marked read' });
  }),
};
