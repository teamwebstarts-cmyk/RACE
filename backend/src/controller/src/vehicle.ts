import type { Request, Response } from 'express';

import { asyncHandler } from '../../utils/src/asyncHandler';
import { sendSuccess } from '../../utils/src/apiResponse';
import { getAuthUser, getParamId } from '../../utils/src/request';
import {
  renderVehicleEmergencyPage,
  renderVehicleNotFoundPage,
} from '../../utils/src/vehicleVerifyPage';
import { vehicleService } from '../../services/src/vehicle';

export class VehicleController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const vehicle = await vehicleService.createVehicle(user.id, req.body);
    return sendSuccess(res, vehicle, 201);
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const vehicles = await vehicleService.listVehicles(user.id);
    return sendSuccess(res, vehicles);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const vehicle = await vehicleService.getVehicle(user.id, getParamId(req.params.id));
    return sendSuccess(res, vehicle);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const vehicle = await vehicleService.updateVehicle(
      user.id,
      getParamId(req.params.id),
      req.body,
    );
    return sendSuccess(res, vehicle);
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    await vehicleService.deleteVehicle(user.id, getParamId(req.params.id));
    return sendSuccess(res, { message: 'Vehicle deleted successfully' });
  });

  verifyQr = asyncHandler(async (req: Request, res: Response) => {
    const result = await vehicleService.verifyVehicleQr(getParamId(req.params.id));
    const prefersHtml = req.accepts(['html', 'json']) === 'html';

    if (prefersHtml) {
      if (!result.valid) {
        return res.status(404).type('html').send(renderVehicleNotFoundPage());
      }

      return res
        .type('html')
        .send(
          renderVehicleEmergencyPage({
            vehicleNumber: result.vehicleNumber,
            brand: result.brand,
            model: result.model,
            vehicleType: result.vehicleType,
            fuelType: result.fuelType,
            color: result.color,
            ownerName: result.ownerName,
            ownerMobile: result.ownerMobile,
            emergencyName: result.emergencyName,
            emergencyMobile: result.emergencyMobile,
            emergencyRelationship: result.emergencyRelationship,
          }),
        );
    }

    return sendSuccess(res, result);
  });

  getQrMetadata = asyncHandler(async (req: Request, res: Response) => {
    const metadata = await vehicleService.getQrMetadata(getParamId(req.params.id));
    return sendSuccess(res, metadata);
  });
}

export const vehicleController = new VehicleController();
