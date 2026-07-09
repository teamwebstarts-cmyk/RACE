import dotenv from 'dotenv';

import { connectDatabase, disconnectDatabase, getDatabaseConnection } from '../database/connection';
import { AdminNotificationModel } from '../modules/admin/models/admin-notification.model';
import { ActivityLogModel } from '../modules/admin/models/activity-log.model';
import { TransactionModel } from '../modules/admin/models/transaction.model';
import { VendorVehicleModel } from '../modules/admin/models/vendor-vehicle.model';
import { BookingModel } from '../modules/bookings/booking.model';
import { DriverBookingModel } from '../modules/bookings/driver/driver-booking.model';
import { TowingBookingModel } from '../modules/bookings/towing/towing-booking.model';
import { SavedLocationModel } from '../modules/locations/location.model';
import { NotificationPrefsModel } from '../modules/notifications/notification-prefs.model';
import { NotificationModel } from '../modules/notifications/notification.model';
import { PaymentMethodModel } from '../modules/payments/payment.model';
import { PaymentTransactionModel } from '../modules/payments/payment-transaction.model';
import { WalletModel } from '../modules/payments/wallet.model';
import { UserSubscriptionModel } from '../modules/subscriptions/subscription.model';
import { VendorDocumentModel } from '../modules/vendors/vendor-document.model';
import { UserModel } from '../modules/users/user.model';
import { VehicleQrCodeModel } from '../modules/vehicles/vehicle-qr.model';
import { VehicleModel } from '../modules/vehicles/vehicle.model';
import { OtpLogModel } from '../models/otp-log.model';

dotenv.config();

type DeleteTarget = {
  collection: string;
  delete: () => Promise<number>;
};

async function deleteFromCollection(collectionName: string): Promise<number> {
  const result = await getDatabaseConnection().collection(collectionName).deleteMany({});
  return result.deletedCount;
}

const DELETE_TARGETS: DeleteTarget[] = [
  { collection: 'users', delete: async () => (await UserModel.deleteMany({})).deletedCount },
  { collection: 'otplogs', delete: async () => (await OtpLogModel.deleteMany({})).deletedCount },
  { collection: 'vehicles', delete: async () => (await VehicleModel.deleteMany({})).deletedCount },
  {
    collection: 'vehicleqrcodes',
    delete: async () => (await VehicleQrCodeModel.deleteMany({})).deletedCount,
  },
  {
    collection: 'towingbookings',
    delete: async () => (await TowingBookingModel.deleteMany({})).deletedCount,
  },
  {
    collection: 'driverbookings',
    delete: async () => (await DriverBookingModel.deleteMany({})).deletedCount,
  },
  {
    collection: 'bookings',
    delete: async () => (await BookingModel.deleteMany({})).deletedCount,
  },
  {
    collection: 'driverenquiries',
    delete: () => deleteFromCollection('driverenquiries'),
  },
  {
    collection: 'vendordocuments',
    delete: async () => (await VendorDocumentModel.deleteMany({})).deletedCount,
  },
  {
    collection: 'vendorvehicles',
    delete: async () => (await VendorVehicleModel.deleteMany({})).deletedCount,
  },
  {
    collection: 'notificationprefs',
    delete: async () => (await NotificationPrefsModel.deleteMany({})).deletedCount,
  },
  {
    collection: 'transactions',
    delete: async () => (await TransactionModel.deleteMany({})).deletedCount,
  },
  {
    collection: 'adminnotifications',
    delete: async () => (await AdminNotificationModel.deleteMany({})).deletedCount,
  },
  {
    collection: 'paymenttransactions',
    delete: async () => (await PaymentTransactionModel.deleteMany({})).deletedCount,
  },
  {
    collection: 'savedlocations',
    delete: async () => (await SavedLocationModel.deleteMany({})).deletedCount,
  },
  {
    collection: 'notifications',
    delete: async () => (await NotificationModel.deleteMany({})).deletedCount,
  },
  { collection: 'wallets', delete: async () => (await WalletModel.deleteMany({})).deletedCount },
  {
    collection: 'paymentmethods',
    delete: async () => (await PaymentMethodModel.deleteMany({})).deletedCount,
  },
  {
    collection: 'activitylogs',
    delete: async () => (await ActivityLogModel.deleteMany({})).deletedCount,
  },
  {
    collection: 'usersubscriptions',
    delete: async () => (await UserSubscriptionModel.deleteMany({})).deletedCount,
  },
  { collection: 'vendors', delete: () => deleteFromCollection('vendors') },
  { collection: 'drivers', delete: () => deleteFromCollection('drivers') },
];

const PRESERVED_COLLECTIONS = [
  'admins (including admin@raceservice.com)',
  'brands',
  'services',
  'subscriptionplans',
  'platformsettings',
];

async function main(): Promise<void> {
  await connectDatabase();

  console.log('\nResetting test data...\n');

  const counts: Record<string, number> = {};

  for (const target of DELETE_TARGETS) {
    counts[target.collection] = await target.delete();
  }

  console.log('Deleted records per collection:');
  for (const target of DELETE_TARGETS) {
    console.log(`  ${target.collection}: ${counts[target.collection]}`);
  }

  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  console.log(`\n  total: ${total}`);

  console.log('\nPreserved collections:');
  for (const name of PRESERVED_COLLECTIONS) {
    console.log(`  ${name}`);
  }
  console.log('');

  await disconnectDatabase();
}

main().catch(async (error: Error) => {
  console.error('Test data reset failed:', error.message);
  await disconnectDatabase().catch(() => undefined);
  process.exit(1);
});
