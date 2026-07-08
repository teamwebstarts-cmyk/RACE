import { Router } from 'express';

import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { vendorDocumentUpload } from '../../middleware/upload.middleware';
import { validate } from '../../middleware/validation.middleware';
import { vendorController } from './vendor.controller';
import {
  claimVendorDriverSchema,
  createVendorDriverSchema,
  uploadVendorDriverDocumentSchema,
} from './vendor-drivers.validator';
import {
  registerVendorSchema,
  saveVendorDraftSchema,
  updateVendorSchema,
  uploadDocumentSchema,
} from './vendor.validator';

const router = Router();

router.use(authMiddleware);

router.post('/draft', validate(saveVendorDraftSchema), vendorController.saveDraft);
router.post('/register', validate(registerVendorSchema), vendorController.register);
router.put('/update', validate(updateVendorSchema), vendorController.update);
router.get('/profile', vendorController.getProfile);
router.get('/status', vendorController.getStatus);
router.get('/dashboard', requireRole('vendor'), vendorController.getDashboard);

router.post(
  '/upload-document',
  vendorDocumentUpload.single('file'),
  validate(uploadDocumentSchema),
  vendorController.uploadDocument,
);

router.post('/selfie', vendorDocumentUpload.single('file'), vendorController.uploadSelfie);

router.get('/drivers', requireRole('vendor'), vendorController.listDrivers);
router.post(
  '/drivers',
  requireRole('vendor'),
  validate(createVendorDriverSchema),
  vendorController.createDriver,
);
router.post(
  '/drivers/:id/upload-document',
  requireRole('vendor'),
  vendorDocumentUpload.single('file'),
  validate(uploadVendorDriverDocumentSchema),
  vendorController.uploadDriverDocument,
);
router.post(
  '/drivers/claim',
  requireRole('vendor'),
  validate(claimVendorDriverSchema),
  vendorController.claimDriver,
);
router.delete('/drivers/:id', requireRole('vendor'), vendorController.removeDriver);

export default router;
