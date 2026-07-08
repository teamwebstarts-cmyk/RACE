import type { Request, Response } from 'express';

import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/apiResponse';
import { emitDriverLocation } from '../../shared/socket.service';
import { getAuthUser, getParamId } from '../../shared/utils/request';
import { UserModel } from '../users/user.model';
import { driverService } from './driver.service';

export class DriverController {
  updateAvailability = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const result = await driverService.updateAvailability(user.id, user.role, req.body);
    return sendSuccess(res, result);
  });

  updateLocation = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const result = await driverService.updateLocation(user.id, user.role, req.body);

    const driver = await UserModel.findById(user.id).select('_id activeBookingId').exec();
    if (driver?.activeBookingId) {
      emitDriverLocation(
        driver.activeBookingId.toString(),
        user.id,
        result.location.latitude,
        result.location.longitude,
      );
    }

    return sendSuccess(res, result);
  });

  listBookings = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const bookings = await driverService.listBookings(user.id, user.role, req.query as never);
    return sendSuccess(res, bookings);
  });

  getActiveBooking = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const result = await driverService.getActiveBooking(user.id, user.role);
    return sendSuccess(res, result);
  });

  updateBookingStatus = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const booking = await driverService.updateBookingStatus(
      user.id,
      user.role,
      getParamId(req.params.id),
      req.body,
    );
    return sendSuccess(res, booking);
  });
}

export const driverController = new DriverController();
