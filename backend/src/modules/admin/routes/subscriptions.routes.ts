import { Router } from 'express';

import { AdminPermission } from '../shared/rbac';
import { adminAuthMiddleware } from '../middleware/admin-auth.middleware';
import { requireAdminPermission } from '../middleware/require-permission.middleware';
import { adminSubscriptionsController } from '../controllers/subscriptions.controller';

const router = Router();

router.get(
  '/subscriptions/overview',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.SUBSCRIPTIONS_VIEW),
  adminSubscriptionsController.getOverview,
);
router.get(
  '/subscriptions/plans',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.SUBSCRIPTIONS_VIEW),
  adminSubscriptionsController.listPlans,
);
router.post(
  '/subscriptions/plans',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.SUBSCRIPTIONS_MANAGE),
  adminSubscriptionsController.createPlan,
);
router.patch(
  '/subscriptions/plans/:id',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.SUBSCRIPTIONS_MANAGE),
  adminSubscriptionsController.updatePlan,
);
router.post(
  '/subscriptions/assign',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.SUBSCRIPTIONS_MANAGE),
  adminSubscriptionsController.assignSubscription,
);
router.post(
  '/subscriptions/:id/cancel',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.SUBSCRIPTIONS_MANAGE),
  adminSubscriptionsController.cancelSubscription,
);

export default router;
