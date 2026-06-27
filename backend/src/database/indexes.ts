import { logger } from '../shared/utils/logger';
import { UserModel } from '../modules/users/user.model';
import { VendorModel } from '../modules/vendors/vendor.model';
import { DriverModel } from '../modules/admin/models/driver.model';
import { BookingModel } from '../modules/bookings/booking.model';
import { TransactionModel } from '../modules/admin/models/transaction.model';
import {
  SubscriptionPlanModel,
  UserSubscriptionModel,
} from '../modules/subscriptions/subscription.model';
import { ActivityLogModel } from '../modules/admin/models/activity-log.model';
import { AdminNotificationModel } from '../modules/admin/models/admin-notification.model';
import { VehicleModel } from '../modules/vehicles/vehicle.model';
import { VendorVehicleModel } from '../modules/admin/models/vendor-vehicle.model';

const MODELS = [
  UserModel,
  VendorModel,
  DriverModel,
  BookingModel,
  TransactionModel,
  SubscriptionPlanModel,
  UserSubscriptionModel,
  ActivityLogModel,
  AdminNotificationModel,
  VehicleModel,
  VendorVehicleModel,
];

export async function ensureDatabaseIndexes(): Promise<void> {
  await Promise.all(MODELS.map((model) => model.syncIndexes()));
  logger.info('MongoDB indexes ensured', { collections: MODELS.map((m) => m.collection.name) });
}
