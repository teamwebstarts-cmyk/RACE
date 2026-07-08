import type { Request, Response } from 'express';

import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/apiResponse';
import { AppError } from '../../shared/utils/errors';
import { getAuthUser, getParamId } from '../../shared/utils/request';
import { vendorDriversService } from './vendor-drivers.service';
import { vendorService } from './vendor.service';

export class VendorController {
  saveDraft = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const vendor = await vendorService.saveDraft(user.id, req.body);
    return sendSuccess(res, vendor);
  });

  register = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const vendor = await vendorService.register(user.id, req.body);
    return sendSuccess(res, vendor, 201);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const vendor = await vendorService.update(user.id, req.body);
    return sendSuccess(res, vendor);
  });

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const vendor = await vendorService.getProfile(user.id);
    return sendSuccess(res, vendor);
  });

  getStatus = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const vendor = await vendorService.getStatus(user.id);
    return sendSuccess(res, vendor);
  });

  getDashboard = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const stats = await vendorService.getDashboardStats(user.id);
    return sendSuccess(res, stats);
  });

  uploadDocument = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const file = req.file;
    if (!file) throw new AppError('No file uploaded', 400);

    const vendor = await vendorService.uploadDocument(user.id, req.body.documentType, {
      buffer: file.buffer,
      mimetype: file.mimetype,
      originalname: file.originalname,
    });
    return sendSuccess(res, vendor, 201);
  });

  uploadSelfie = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const file = req.file;
    if (!file) throw new AppError('No file uploaded', 400);

    const vendor = await vendorService.uploadSelfie(user.id, {
      buffer: file.buffer,
      mimetype: file.mimetype,
      originalname: file.originalname,
    });
    return sendSuccess(res, vendor, 201);
  });

  // Admin
  listForAdmin = asyncHandler(async (req: Request, res: Response) => {
    const vendors = await vendorService.listForAdmin({
      status: req.query.status as string | undefined,
      verificationStage: req.query.verificationStage as string | undefined,
    });
    return sendSuccess(res, vendors);
  });

  getByIdForAdmin = asyncHandler(async (req: Request, res: Response) => {
    const vendor = await vendorService.getByIdForAdmin(getParamId(req.params.id));
    return sendSuccess(res, vendor);
  });

  approve = asyncHandler(async (req: Request, res: Response) => {
    const vendor = await vendorService.approve(getParamId(req.params.id), req.body.reviewNotes);
    return sendSuccess(res, vendor);
  });

  reject = asyncHandler(async (req: Request, res: Response) => {
    const vendor = await vendorService.reject(getParamId(req.params.id), req.body.reviewNotes);
    return sendSuccess(res, vendor);
  });

  requestResubmission = asyncHandler(async (req: Request, res: Response) => {
    const vendor = await vendorService.requestResubmission(
      getParamId(req.params.id),
      req.body.reviewNotes,
    );
    return sendSuccess(res, vendor);
  });

  reviewDocument = asyncHandler(async (req: Request, res: Response) => {
    const documentType = Array.isArray(req.params.documentType)
      ? req.params.documentType[0]
      : req.params.documentType;
    const vendor = await vendorService.reviewDocument(
      getParamId(req.params.id),
      documentType,
      req.body,
    );
    return sendSuccess(res, vendor);
  });

  listDrivers = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const drivers = await vendorDriversService.list(user.id);
    return sendSuccess(res, drivers);
  });

  createDriver = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const driver = await vendorDriversService.create(user.id, req.body);
    return sendSuccess(res, driver, 201);
  });

  claimDriver = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const driver = await vendorDriversService.claimByPhone(user.id, req.body.phone);
    return sendSuccess(res, driver);
  });

  removeDriver = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const result = await vendorDriversService.remove(user.id, getParamId(req.params.id));
    return sendSuccess(res, result);
  });
}

export const vendorController = new VendorController();
