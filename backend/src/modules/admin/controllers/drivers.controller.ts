import type { Request, Response } from 'express';

import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { sendSuccess } from '../../../shared/utils/apiResponse';
import { adminDriversService } from '../drivers/admin-drivers.service';
import { listAvailableDrivers } from '../../bookings/shared/driver-assignment.service';
import { routeParam } from '../shared/route-param';
import { getAdminActor } from '../utils/request.utils';

export const adminDriversController = {
  getCounts: asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, await adminDriversService.getCounts());
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminDriversService.list(req.query as never));
  }),

  listAvailable: asyncHandler(async (req: Request, res: Response) => {
    const lat = req.query.lat !== undefined ? Number(req.query.lat) : undefined;
    const lng = req.query.lng !== undefined ? Number(req.query.lng) : undefined;
    const bookingType =
      req.query.bookingType === 'towing' || req.query.bookingType === 'driver'
        ? req.query.bookingType
        : undefined;
    const hasCoords =
      lat !== undefined && !Number.isNaN(lat) && lng !== undefined && !Number.isNaN(lng);
    sendSuccess(
      res,
      await listAvailableDrivers({
        ...(hasCoords ? { latitude: lat, longitude: lng } : {}),
        ...(bookingType ? { bookingType } : {}),
      }),
    );
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminDriversService.getById(routeParam(req.params.id)));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminDriversService.create(req.body, getAdminActor(req)), 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminDriversService.update(routeParam(req.params.id), req.body, getAdminActor(req)));
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await adminDriversService.remove(routeParam(req.params.id), getAdminActor(req));
    sendSuccess(res, { message: 'Deleted' });
  }),

  approve: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminDriversService.update(
      routeParam(req.params.id),
      { status: 'APPROVED' },
      getAdminActor(req),
    ));
  }),

  reject: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminDriversService.update(
      routeParam(req.params.id),
      { status: 'REJECTED' },
      getAdminActor(req),
    ));
  }),

  reviewDocument: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminDriversService.reviewDocument(
      routeParam(req.params.id),
      routeParam(req.params.documentId),
      req.body.status,
      getAdminActor(req),
    ));
  }),
};
