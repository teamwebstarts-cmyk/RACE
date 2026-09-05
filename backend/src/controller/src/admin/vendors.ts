import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/src/asyncHandler';
import { sendSuccess } from '../../../utils/src/apiResponse';
import { adminVendorsService } from '../../../services/src/admin/adminVendors';
import { adminVehiclesService } from '../../../services/src/admin/adminVehicles';
import { routeParam } from '../../../services/src/admin/routeParam';
import { getAdminActor } from '../../../utils/src/adminRequest.utils';

export const adminVendorsController = {
  getCounts: asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, await adminVendorsService.getCounts());
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminVendorsService.list(req.query as never));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminVendorsService.getById(routeParam(req.params.id)));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminVendorsService.create(req.body, getAdminActor(req)), 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminVendorsService.update(routeParam(req.params.id), req.body, getAdminActor(req)));
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await adminVendorsService.remove(routeParam(req.params.id), getAdminActor(req));
    sendSuccess(res, { message: 'Deleted' });
  }),

  approve: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminVendorsService.approve(routeParam(req.params.id), getAdminActor(req)));
  }),

  reject: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminVendorsService.reject(
      routeParam(req.params.id),
      req.body.note,
      getAdminActor(req),
    ));
  }),

  reviewDocument: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminVendorsService.reviewDocument(
      routeParam(req.params.id),
      routeParam(req.params.docKey),
      req.body.status,
      getAdminActor(req),
    ));
  }),

  suspend: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminVendorsService.suspend(
      routeParam(req.params.id),
      req.body.note,
      getAdminActor(req),
    ));
  }),

  assignDrivers: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminVendorsService.assignDrivers(
      routeParam(req.params.id),
      req.body.driverIds ?? [],
      getAdminActor(req),
    ));
  }),

  unassignDriver: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(
      res,
      await adminVendorsService.unassignDriver(
        routeParam(req.params.id),
        routeParam(req.params.driverId),
        getAdminActor(req),
      ),
    );
  }),

  listVehicles: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminVehiclesService.listByVendor(routeParam(req.params.id)));
  }),

  createVehicle: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminVehiclesService.create(routeParam(req.params.id), req.body, getAdminActor(req)), 201);
  }),

  listFleetDrivers: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminVendorsService.listFleetDrivers(routeParam(req.params.id)));
  }),

  createFleetDriver: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(
      res,
      await adminVendorsService.createFleetDriver(
        routeParam(req.params.id),
        req.body,
        getAdminActor(req),
      ),
      201,
    );
  }),

  removeFleetDriver: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(
      res,
      await adminVendorsService.removeFleetDriver(
        routeParam(req.params.id),
        routeParam(req.params.driverId),
        getAdminActor(req),
      ),
    );
  }),
};
