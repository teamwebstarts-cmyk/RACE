import type { Request, Response } from 'express';

import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/apiResponse';
import { getAuthUser, getParamId } from '../../shared/utils/request';
import { paymentService } from './payment.service';

export class PaymentController {
  listMethods = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    await paymentService.seedDefaultMethods(user.id);
    const methods = await paymentService.listMethods(user.id);
    return sendSuccess(res, methods);
  });

  createMethod = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const method = await paymentService.createMethod(user.id, req.body);
    return sendSuccess(res, method, 201);
  });

  removeMethod = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    await paymentService.removeMethod(user.id, getParamId(req.params.id));
    return sendSuccess(res, { message: 'Payment method removed' });
  });

  getWallet = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const wallet = await paymentService.getWallet(user.id);
    return sendSuccess(res, wallet);
  });
}

export const paymentController = new PaymentController();
