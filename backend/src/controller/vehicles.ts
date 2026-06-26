import { Router } from 'express';
import type { Request, Response } from 'express';

import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { getAuthUser, getParamId } from '../utils/request';
import {
  renderVehicleNotFoundPage,
  renderVehicleVerifyPage,
} from '../utils/vehicleVerifyPage';
import { vehicleService } from '../services/vehicle';
import { authenticator, validate } from '../middleware';
import {
  createVehicleSchema,
  updateVehicleSchema,
  vehicleIdSchema,
} from './helper/vehicle';

const router = Router();

router.get(
  '/:id/verify',
  validate(vehicleIdSchema, 'params'),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await vehicleService.verifyVehicleQr(getParamId(req.params.id));
    const prefersHtml = req.accepts(['html', 'json']) === 'html';

    if (prefersHtml) {
      if (!result.valid) {
        return res.status(404).type('html').send(renderVehicleNotFoundPage());
      }

      return res
        .type('html')
        .send(
          renderVehicleVerifyPage({
            vehicleNumber: result.vehicleNumber,
            brand: result.brand,
            model: result.model,
            vehicleType: result.vehicleType,
            fuelType: result.fuelType,
            color: result.color,
          }),
        );
    }

    return sendSuccess(res, result);
  }),
);

router.use(authenticator);

router.post(
  '/',
  validate(createVehicleSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const vehicle = await vehicleService.createVehicle(user.id, req.body);
    return sendSuccess(res, vehicle, 201);
  }),
);

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const vehicles = await vehicleService.listVehicles(user.id);
    return sendSuccess(res, vehicles);
  }),
);

router.get(
  '/:id',
  validate(vehicleIdSchema, 'params'),
  asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const vehicle = await vehicleService.getVehicle(user.id, getParamId(req.params.id));
    return sendSuccess(res, vehicle);
  }),
);

router.put(
  '/:id',
  validate(vehicleIdSchema, 'params'),
  validate(updateVehicleSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const vehicle = await vehicleService.updateVehicle(
      user.id,
      getParamId(req.params.id),
      req.body,
    );
    return sendSuccess(res, vehicle);
  }),
);

router.delete(
  '/:id',
  validate(vehicleIdSchema, 'params'),
  asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    await vehicleService.deleteVehicle(user.id, getParamId(req.params.id));
    return sendSuccess(res, { message: 'Vehicle deleted successfully' });
  }),
);

export default router;
