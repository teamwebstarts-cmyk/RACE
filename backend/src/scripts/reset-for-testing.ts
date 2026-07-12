import dotenv from 'dotenv';

import { connectDatabase, disconnectDatabase, getDatabaseConnection } from '../database/src/connection';
import { AdminNotificationModel } from '../models/src/adminNotification';
import { ActivityLogModel } from '../models/src/activityLog';
import { BookingModel } from '../models/src/booking';
import { TransactionModel } from '../models/src/transaction';
import { VendorVehicleModel } from '../models/src/vendorVehicle';
import { DriverBookingModel } from '../models/src/driverBooking';
import { TowingBookingModel } from '../models/src/towingBooking';
import { SavedLocationModel } from '../models/src/location';
import { NotificationPrefsModel } from '../models/src/notificationPrefs';
import { NotificationModel } from '../models/src/notification';
import { PaymentMethodModel } from '../models/src/payment';
import { PaymentTransactionModel } from '../models/src/paymentTransaction';
import { WalletModel } from '../models/src/wallet';
import { UserSubscriptionModel } from '../models/src/subscription';
import { VendorDocumentModel } from '../models/src/vendorDocument';
import { UserModel } from '../models/src/user';
import { VehicleQrCodeModel } from '../models/src/vehicleQr';
import { VehicleModel } from '../models/src/vehicle';
import { OtpLogModel } from '../models/src/otpLog';

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
    collection: 'vendorvehicles',
    delete: async () => (await VendorVehicleModel.deleteMany({})).deletedCount,
  },
  {
    collection: 'transactions',
    delete: async () => (await TransactionModel.deleteMany({})).deletedCount,
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
