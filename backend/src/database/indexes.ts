import { logger } from '../shared/utils/logger';
import { UserModel } from '../modules/users/user.model';
import { BookingModel } from '../modules/bookings/booking.model';
import { DriverBookingModel } from '../modules/bookings/driver/driver-booking.model';
import { TowingBookingModel } from '../modules/bookings/towing/towing-booking.model';
import { PaymentTransactionModel } from '../modules/payments/payment-transaction.model';
import { TransactionModel } from '../modules/admin/models/transaction.model';
import {
  SubscriptionPlanModel,
  UserSubscriptionModel,
} from '../modules/subscriptions/subscription.model';
import { ActivityLogModel } from '../modules/admin/models/activity-log.model';
import { NotificationModel } from '../modules/notifications/notification.model';
import { VehicleModel } from '../modules/vehicles/vehicle.model';
import { VendorVehicleModel } from '../modules/admin/models/vendor-vehicle.model';

const MODELS = [
  UserModel,
  BookingModel,
  TowingBookingModel,
  DriverBookingModel,
  PaymentTransactionModel,
  TransactionModel,
  SubscriptionPlanModel,
  UserSubscriptionModel,
  ActivityLogModel,
  NotificationModel,
  VehicleModel,
  VendorVehicleModel,
];

export async function ensureDatabaseIndexes(): Promise<void> {
  await Promise.all(MODELS.map((model) => model.syncIndexes()));
  logger.info('MongoDB indexes ensured', { collections: MODELS.map((m) => m.collection.name) });
}
