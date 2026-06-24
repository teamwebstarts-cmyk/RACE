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
import { adminVehiclesService } from './vehicles/admin-vehicles.service';
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
router.patch(
  '/customers/:id/status',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.CUSTOMERS_MANAGE),
  asyncHandler(async (req, res) => {
    sendSuccess(res, await adminCustomersService.setStatus(
      routeParam(req.params.id),
      req.body.status,
      actor(req),
    ));
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
router.post('/vendors', adminAuthMiddleware, requireAdminPermission(AdminPermission.VENDORS_MANAGE), asyncHandler(async (req, res) => {
  sendSuccess(res, await adminVendorsService.create(req.body, actor(req)), 201);
}));
router.patch('/vendors/:id', adminAuthMiddleware, requireAdminPermission(AdminPermission.VENDORS_MANAGE), asyncHandler(async (req, res) => {
  sendSuccess(res, await adminVendorsService.update(routeParam(req.params.id), req.body, actor(req)));
}));
router.post('/vendors/:id/suspend', adminAuthMiddleware, requireAdminPermission(AdminPermission.VENDORS_MANAGE), asyncHandler(async (req, res) => {
  sendSuccess(res, await adminVendorsService.suspend(routeParam(req.params.id), req.body.note, actor(req)));
}));
router.post('/vendors/:id/assign-drivers', adminAuthMiddleware, requireAdminPermission(AdminPermission.VENDORS_MANAGE), asyncHandler(async (req, res) => {
  sendSuccess(res, await adminVendorsService.assignDrivers(routeParam(req.params.id), req.body.driverIds ?? [], actor(req)));
}));
router.get('/vendors/:id/vehicles', adminAuthMiddleware, requireAdminPermission(AdminPermission.VENDORS_VIEW), asyncHandler(async (req, res) => {
  sendSuccess(res, await adminVehiclesService.listByVendor(routeParam(req.params.id)));
}));
router.post('/vendors/:id/vehicles', adminAuthMiddleware, requireAdminPermission(AdminPermission.VENDORS_MANAGE), asyncHandler(async (req, res) => {
  sendSuccess(res, await adminVehiclesService.create(routeParam(req.params.id), req.body, actor(req)), 201);
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
router.post('/drivers/:id/approve', adminAuthMiddleware, requireAdminPermission(AdminPermission.DRIVERS_APPROVE), asyncHandler(async (req, res) => {
  sendSuccess(res, await adminDriversService.update(routeParam(req.params.id), { status: 'APPROVED' }, actor(req)));
}));
router.post('/drivers/:id/reject', adminAuthMiddleware, requireAdminPermission(AdminPermission.DRIVERS_APPROVE), asyncHandler(async (req, res) => {
  sendSuccess(res, await adminDriversService.update(routeParam(req.params.id), { status: 'REJECTED' }, actor(req)));
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
router.post('/bookings/:id/assign-vendor', adminAuthMiddleware, requireAdminPermission(AdminPermission.BOOKINGS_MANAGE), asyncHandler(async (req, res) => {
  sendSuccess(res, await adminBookingsService.assignVendor(routeParam(req.params.id), req.body.vendorId, actor(req)));
}));
router.post('/bookings/:id/assign-driver', adminAuthMiddleware, requireAdminPermission(AdminPermission.BOOKINGS_MANAGE), asyncHandler(async (req, res) => {
  sendSuccess(res, await adminBookingsService.assignDriver(routeParam(req.params.id), req.body.driverId, actor(req)));
}));
router.post('/bookings/:id/status', adminAuthMiddleware, requireAdminPermission(AdminPermission.BOOKINGS_MANAGE), asyncHandler(async (req, res) => {
  sendSuccess(res, await adminBookingsService.updateStatus(
    routeParam(req.params.id),
    req.body.status,
    actor(req),
    { reason: req.body.reason, amount: req.body.amount },
  ));
}));
router.patch('/vehicles/:id', adminAuthMiddleware, requireAdminPermission(AdminPermission.VENDORS_MANAGE), asyncHandler(async (req, res) => {
  sendSuccess(res, await adminVehiclesService.update(routeParam(req.params.id), req.body, actor(req)));
}));
router.delete('/vehicles/:id', adminAuthMiddleware, requireAdminPermission(AdminPermission.VENDORS_MANAGE), asyncHandler(async (req, res) => {
  await adminVehiclesService.remove(routeParam(req.params.id), actor(req));
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
router.post('/subscriptions/plans', adminAuthMiddleware, requireAdminPermission(AdminPermission.SUBSCRIPTIONS_MANAGE), asyncHandler(async (req, res) => {
  sendSuccess(res, await adminSubscriptionsService.createPlan(req.body, actor(req)), 201);
}));
router.patch('/subscriptions/plans/:id', adminAuthMiddleware, requireAdminPermission(AdminPermission.SUBSCRIPTIONS_MANAGE), asyncHandler(async (req, res) => {
  sendSuccess(res, await adminSubscriptionsService.updatePlan(routeParam(req.params.id), req.body, actor(req)));
}));
router.post('/subscriptions/assign', adminAuthMiddleware, requireAdminPermission(AdminPermission.SUBSCRIPTIONS_MANAGE), asyncHandler(async (req, res) => {
  sendSuccess(res, await adminSubscriptionsService.assignSubscription(req.body, actor(req)), 201);
}));
router.post('/subscriptions/:id/cancel', adminAuthMiddleware, requireAdminPermission(AdminPermission.SUBSCRIPTIONS_MANAGE), asyncHandler(async (req, res) => {
  sendSuccess(res, await adminSubscriptionsService.cancelSubscription(routeParam(req.params.id), actor(req)));
}));

export default router;
