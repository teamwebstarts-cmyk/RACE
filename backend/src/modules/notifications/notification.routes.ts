import { Router } from 'express';

import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { notificationController } from './notification.controller';
import { updateNotificationPrefsSchema } from './notification.validator';

const router = Router();

router.use(authMiddleware);

router.get('/', notificationController.list);
router.patch('/read-all', notificationController.markAllRead);
router.get('/preferences', notificationController.getPrefs);
router.patch('/preferences', validate(updateNotificationPrefsSchema), notificationController.updatePrefs);

export default router;
