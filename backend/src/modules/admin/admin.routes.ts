import { Router } from 'express';
import type { Request } from 'express';

import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/apiResponse';
import { AdminPermission } from './shared/rbac';
import { adminAuthMiddleware } from './middleware/admin-auth.middleware';
import { requireAdminPermission } from './middleware/require-permission.middleware';
import adminAuthRoutes from './auth/admin-auth.routes';
import adminDashboardRoutes from './dashboard/admin-dashboard.routes';
import { adminCustomersService } from './customers/admin-customers.service';
import { adminVendorsService } from './vendors/admin-vendors.service';
import { adminDriversService } from './drivers/admin-drivers.service';
import { adminBookingsService } from './bookings/admin-bookings.service';
import { adminFinanceService } from './finance/admin-finance.service';
import { adminReportsService } from './reports/admin-reports.service';
import { adminSettingsService } from './settings/admin-settings.service';
import { adminNotificationsService } from './notifications/admin-notifications.service';
import { adminUsersService, adminActivityService } from './admins/admin-users.service';
import { adminSubscriptionsService } from './subscriptions/admin-subscriptions.service';
import { routeParam } from './shared/route-param';

const router = Router();

router.use('/auth', adminAuthRoutes);
router.use('/dashboard', adminDashboardRoutes);

function actor(req: Request) {
  return { id: req.admin!.id, name: req.admin!.email };
}

// Customers
router.get(
  '/customers',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.CUSTOMERS_VIEW),
  asyncHandler(async (req, res) => {
    sendSuccess(res, await adminCustomersService.list(req.query as never));
  }),
);
router.get(
  '/customers/cities',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.CUSTOMERS_VIEW),
  asyncHandler(async (_req, res) => {
    sendSuccess(res, await adminCustomersService.getCities());
  }),
);
router.get(
  '/customers/:id',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.CUSTOMERS_VIEW),
  asyncHandler(async (req, res) => {
    sendSuccess(res, await adminCustomersService.getById(routeParam(req.params.id)));
  }),
);
router.post(
  '/customers',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.CUSTOMERS_MANAGE),
  asyncHandler(async (req, res) => {
    sendSuccess(res, await adminCustomersService.create(req.body, actor(req)), 201);
  }),
);
router.patch(
  '/customers/:id',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.CUSTOMERS_MANAGE),
  asyncHandler(async (req, res) => {
    sendSuccess(res, await adminCustomersService.update(routeParam(req.params.id), req.body, actor(req)));
  }),
);
router.delete(
  '/customers/:id',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.CUSTOMERS_MANAGE),
  asyncHandler(async (req, res) => {
    await adminCustomersService.remove(routeParam(req.params.id), actor(req));
    sendSuccess(res, { message: 'Deleted' });
  }),
);
router.get(
  '/customers/export/csv',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.CUSTOMERS_VIEW),
  asyncHandler(async (req, res) => {
    sendSuccess(res, await adminCustomersService.export(req.query as never));
  }),
);

// Vendors
router.get('/vendors/counts', adminAuthMiddleware, requireAdminPermission(AdminPermission.VENDORS_VIEW), asyncHandler(async (_req, res) => {
  sendSuccess(res, await adminVendorsService.getCounts());
}));
router.get('/vendors', adminAuthMiddleware, requireAdminPermission(AdminPermission.VENDORS_VIEW), asyncHandler(async (req, res) => {
  sendSuccess(res, await adminVendorsService.list(req.query as never));
}));
router.get('/vendors/:id', adminAuthMiddleware, requireAdminPermission(AdminPermission.VENDORS_VIEW), asyncHandler(async (req, res) => {
  sendSuccess(res, await adminVendorsService.getById(routeParam(req.params.id)));
}));
router.post('/vendors/:id/approve', adminAuthMiddleware, requireAdminPermission(AdminPermission.VENDORS_APPROVE), asyncHandler(async (req, res) => {
  sendSuccess(res, await adminVendorsService.approve(routeParam(req.params.id), actor(req)));
}));
router.post('/vendors/:id/reject', adminAuthMiddleware, requireAdminPermission(AdminPermission.VENDORS_APPROVE), asyncHandler(async (req, res) => {
  sendSuccess(res, await adminVendorsService.reject(routeParam(req.params.id), req.body.note, actor(req)));
}));

// Drivers
router.get('/drivers/counts', adminAuthMiddleware, requireAdminPermission(AdminPermission.DRIVERS_VIEW), asyncHandler(async (_req, res) => {
  sendSuccess(res, await adminDriversService.getCounts());
}));
router.get('/drivers', adminAuthMiddleware, requireAdminPermission(AdminPermission.DRIVERS_VIEW), asyncHandler(async (req, res) => {
  sendSuccess(res, await adminDriversService.list(req.query as never));
}));
router.get('/drivers/:id', adminAuthMiddleware, requireAdminPermission(AdminPermission.DRIVERS_VIEW), asyncHandler(async (req, res) => {
  sendSuccess(res, await adminDriversService.getById(routeParam(req.params.id)));
}));
router.post('/drivers', adminAuthMiddleware, requireAdminPermission(AdminPermission.DRIVERS_MANAGE), asyncHandler(async (req, res) => {
  sendSuccess(res, await adminDriversService.create(req.body, actor(req)), 201);
}));
router.patch('/drivers/:id', adminAuthMiddleware, requireAdminPermission(AdminPermission.DRIVERS_MANAGE), asyncHandler(async (req, res) => {
  sendSuccess(res, await adminDriversService.update(routeParam(req.params.id), req.body, actor(req)));
}));
router.delete('/drivers/:id', adminAuthMiddleware, requireAdminPermission(AdminPermission.DRIVERS_MANAGE), asyncHandler(async (req, res) => {
  await adminDriversService.remove(routeParam(req.params.id), actor(req));
  sendSuccess(res, { message: 'Deleted' });
}));

// Bookings
router.get('/bookings', adminAuthMiddleware, requireAdminPermission(AdminPermission.BOOKINGS_VIEW), asyncHandler(async (req, res) => {
  sendSuccess(res, await adminBookingsService.list(req.query as never));
}));
router.get('/bookings/counts', adminAuthMiddleware, requireAdminPermission(AdminPermission.BOOKINGS_VIEW), asyncHandler(async (_req, res) => {
  sendSuccess(res, await adminBookingsService.getCounts());
}));
router.get('/bookings/:id', adminAuthMiddleware, requireAdminPermission(AdminPermission.BOOKINGS_VIEW), asyncHandler(async (req, res) => {
  sendSuccess(res, await adminBookingsService.getById(routeParam(req.params.id)));
}));
router.post('/bookings', adminAuthMiddleware, requireAdminPermission(AdminPermission.BOOKINGS_MANAGE), asyncHandler(async (req, res) => {
  sendSuccess(res, await adminBookingsService.create(req.body, actor(req)), 201);
}));
router.patch('/bookings/:id', adminAuthMiddleware, requireAdminPermission(AdminPermission.BOOKINGS_MANAGE), asyncHandler(async (req, res) => {
  sendSuccess(res, await adminBookingsService.update(routeParam(req.params.id), req.body, actor(req)));
}));
router.delete('/bookings/:id', adminAuthMiddleware, requireAdminPermission(AdminPermission.BOOKINGS_MANAGE), asyncHandler(async (req, res) => {
  await adminBookingsService.remove(routeParam(req.params.id), actor(req));
  sendSuccess(res, { message: 'Deleted' });
}));

// Finance
router.get('/transactions', adminAuthMiddleware, requireAdminPermission(AdminPermission.FINANCE_VIEW), asyncHandler(async (req, res) => {
  sendSuccess(res, await adminFinanceService.listTransactions(req.query as never));
}));
router.get('/transactions/summary', adminAuthMiddleware, requireAdminPermission(AdminPermission.FINANCE_VIEW), asyncHandler(async (_req, res) => {
  sendSuccess(res, await adminFinanceService.getSummary());
}));

// Reports
router.get('/reports', adminAuthMiddleware, requireAdminPermission(AdminPermission.REPORTS_VIEW), asyncHandler(async (req, res) => {
  sendSuccess(res, await adminReportsService.getReports(req.query.dateFrom as string, req.query.dateTo as string));
}));

// Settings
router.get('/settings', adminAuthMiddleware, requireAdminPermission(AdminPermission.SETTINGS_VIEW), asyncHandler(async (_req, res) => {
  sendSuccess(res, await adminSettingsService.get());
}));
router.put('/settings', adminAuthMiddleware, requireAdminPermission(AdminPermission.SETTINGS_MANAGE), asyncHandler(async (req, res) => {
  sendSuccess(res, await adminSettingsService.update(req.body, actor(req)));
}));

// Notifications
router.get('/notifications', adminAuthMiddleware, requireAdminPermission(AdminPermission.NOTIFICATIONS_VIEW), asyncHandler(async (req, res) => {
  sendSuccess(res, await adminNotificationsService.list(req.query as never));
}));
router.get('/notifications/unread-count', adminAuthMiddleware, requireAdminPermission(AdminPermission.NOTIFICATIONS_VIEW), asyncHandler(async (_req, res) => {
  sendSuccess(res, { count: await adminNotificationsService.getUnreadCount() });
}));
router.patch('/notifications/:id/read', adminAuthMiddleware, requireAdminPermission(AdminPermission.NOTIFICATIONS_VIEW), asyncHandler(async (req, res) => {
  await adminNotificationsService.markRead(routeParam(req.params.id));
  sendSuccess(res, { message: 'Marked read' });
}));
router.post('/notifications/read-all', adminAuthMiddleware, requireAdminPermission(AdminPermission.NOTIFICATIONS_VIEW), asyncHandler(async (_req, res) => {
  await adminNotificationsService.markAllRead();
  sendSuccess(res, { message: 'All marked read' });
}));

// Admin users
router.get('/admins', adminAuthMiddleware, requireAdminPermission(AdminPermission.ADMIN_USERS_VIEW), asyncHandler(async (req, res) => {
  sendSuccess(res, await adminUsersService.list(req.query as never));
}));
router.post('/admins', adminAuthMiddleware, requireAdminPermission(AdminPermission.ADMIN_USERS_MANAGE), asyncHandler(async (req, res) => {
  sendSuccess(res, await adminUsersService.create(req.body, actor(req)), 201);
}));
router.patch('/admins/:id', adminAuthMiddleware, requireAdminPermission(AdminPermission.ADMIN_USERS_MANAGE), asyncHandler(async (req, res) => {
  sendSuccess(res, await adminUsersService.update(routeParam(req.params.id), req.body, actor(req)));
}));
router.delete('/admins/:id', adminAuthMiddleware, requireAdminPermission(AdminPermission.ADMIN_USERS_MANAGE), asyncHandler(async (req, res) => {
  await adminUsersService.remove(routeParam(req.params.id), actor(req));
  sendSuccess(res, { message: 'Deleted' });
}));

// Activity logs
router.get('/activity-logs', adminAuthMiddleware, requireAdminPermission(AdminPermission.AUDIT_LOGS_VIEW), asyncHandler(async (req, res) => {
  sendSuccess(res, await adminActivityService.list(req.query as never));
}));

// Subscriptions
router.get('/subscriptions/overview', adminAuthMiddleware, requireAdminPermission(AdminPermission.SUBSCRIPTIONS_VIEW), asyncHandler(async (_req, res) => {
  sendSuccess(res, await adminSubscriptionsService.getOverview());
}));
router.get('/subscriptions/plans', adminAuthMiddleware, requireAdminPermission(AdminPermission.SUBSCRIPTIONS_VIEW), asyncHandler(async (req, res) => {
  sendSuccess(res, await adminSubscriptionsService.listPlans(req.query as never));
}));

export default router;
