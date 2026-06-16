import { Router } from 'express';

import { authMiddleware } from '../../middleware/auth.middleware';
import { vendorDocumentUpload } from '../../middleware/upload.middleware';
import { validate } from '../../middleware/validation.middleware';
import { vendorController } from './vendor.controller';
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

router.post(
  '/upload-document',
  vendorDocumentUpload.single('file'),
  validate(uploadDocumentSchema),
  vendorController.uploadDocument,
);

router.post('/selfie', vendorDocumentUpload.single('file'), vendorController.uploadSelfie);

export default router;
