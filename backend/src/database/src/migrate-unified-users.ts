/**
 * One-time migration: merge legacy vendors/drivers/admins collections into unified users,
 * and merge adminnotifications into notifications.
 *
 * Usage: npm run migrate:unified-users
 */
import mongoose, { Types } from 'mongoose';

import { connectDatabase, disconnectDatabase } from './connection';
import { UserModel } from '../../models/src/user';
import { NotificationModel } from '../../models/src/notification';
import { logger } from '../../utils/src/logger';

async function migrateVendors(db: mongoose.mongo.Db) {
  const vendors = await db.collection('vendors').find({}).toArray();
  const vendorIdMap = new Map<string, string>();

  for (const vendor of vendors) {
    const userId = vendor.userId?.toString();
    if (!userId) continue;

    const user = await UserModel.findById(userId);
    if (!user) {
      logger.warn('Vendor user missing, skipping', { vendorId: vendor._id.toString(), userId });
      continue;
    }

    user.role = 'vendor';
    user.isVerified = true;
    user.vendorProfile = {
      vendorType: vendor.vendorType,
      status: vendor.status,
      verificationStage: vendor.verificationStage,
      businessName: vendor.businessName,
      ownerName: vendor.ownerName,
      address: vendor.address,
      towVehicle: vendor.towVehicle,
      bankDetails: vendor.bankDetails,
      partnerDriverDetails: vendor.driverProfile,
      reviewNotes: vendor.reviewNotes,
      documentReviews: vendor.documentReviews,
      statusHistory: vendor.statusHistory ?? [],
      submittedAt: vendor.submittedAt,
      approvedAt: vendor.approvedAt,
    };

    if (vendor.mobileNumber) user.mobileNumber = vendor.mobileNumber;
    if (vendor.email) user.email = vendor.email;
    if (vendor.ownerName) user.fullName = vendor.ownerName;

    await user.save();
    vendorIdMap.set(vendor._id.toString(), user._id.toString());

    await db.collection('vendordocuments').updateMany(
      { vendorId: vendor._id },
      { $set: { vendorId: user._id } },
    );
    await db.collection('vendorvehicles').updateMany(
      { vendorId: vendor._id },
      { $set: { vendorId: user._id } },
    );
    await db.collection('bookings').updateMany(
      { vendorId: vendor._id },
      { $set: { vendorId: user._id } },
    );
    await db.collection('transactions').updateMany(
      { vendorId: vendor._id },
      { $set: { vendorId: user._id } },
    );
    await db.collection('towingbookings').updateMany(
      { vendorId: vendor._id },
      { $set: { vendorId: user._id } },
    );
    await db.collection('driverbookings').updateMany(
      { vendorId: vendor._id },
      { $set: { vendorId: user._id } },
    );
  }

  return vendorIdMap;
}

async function migrateDrivers(db: mongoose.mongo.Db, vendorIdMap: Map<string, string>) {
  const drivers = await db.collection('drivers').find({}).toArray();

  for (const driver of drivers) {
    const existing = await UserModel.findOne({
      role: 'driver',
      'driverProfile.licenseNo': driver.licenseNo,
    });

    const vendorUserId = driver.vendorId
      ? vendorIdMap.get(driver.vendorId.toString()) ?? driver.vendorId.toString()
      : undefined;

    if (existing) {
      await db.collection('bookings').updateMany(
        { 'driver.id': driver._id.toString() },
        {
          $set: {
            'driver.id': existing._id.toString(),
            'driver.name': existing.fullName,
            'driver.phone': existing.mobileNumber,
          },
        },
      );
      await db.collection('towingbookings').updateMany(
        { driverId: driver._id },
        { $set: { driverId: existing._id } },
      );
      await db.collection('driverbookings').updateMany(
        { driverId: driver._id },
        { $set: { driverId: existing._id } },
      );
      await db.collection('transactions').updateMany(
        { driverId: driver._id },
        { $set: { driverId: existing._id } },
      );
      continue;
    }

    const user = await UserModel.create({
      mobileNumber: driver.phone,
      fullName: driver.name,
      email: driver.email,
      role: 'driver',
      isVerified: true,
      isProfileCompleted: true,
      driverProfile: {
        driverCode: driver.driverCode,
        licenseNo: driver.licenseNo,
        vendorUserId: vendorUserId ? new Types.ObjectId(vendorUserId) : undefined,
        driverType: driver.driverType,
        city: driver.city,
        state: driver.state,
        vehicleRegistration: driver.vehicleRegistration,
        rating: driver.rating ?? 0,
        reviewCount: driver.reviewCount ?? 0,
        status: driver.status ?? 'PENDING',
        totalTrips: driver.totalTrips ?? 0,
        documents: driver.documents ?? [],
        statusHistory: driver.statusHistory ?? [],
      },
    });

    await db.collection('bookings').updateMany(
      { 'driver.id': driver._id.toString() },
      {
        $set: {
          'driver.id': user._id.toString(),
          'driver.name': user.fullName,
          'driver.phone': user.mobileNumber,
        },
      },
    );
    await db.collection('towingbookings').updateMany(
      { driverId: driver._id },
      { $set: { driverId: user._id } },
    );
    await db.collection('driverbookings').updateMany(
      { driverId: driver._id },
      { $set: { driverId: user._id } },
    );
    await db.collection('transactions').updateMany(
      { driverId: driver._id },
      { $set: { driverId: user._id } },
    );
  }
}

async function migrateNotifications(db: mongoose.mongo.Db) {
  const adminNotifications = await db.collection('adminnotifications').find({}).toArray();

  for (const item of adminNotifications) {
    const exists = await NotificationModel.findOne({
      title: item.title,
      message: item.message ?? '',
      'recipient.audience': 'admin',
    });
    if (exists) continue;

    await NotificationModel.create({
      recipient: { audience: 'admin' },
      title: item.title,
      message: item.message ?? '',
      type: item.type ?? 'info',
      category: item.category ?? 'system',
      isRead: item.isRead ?? false,
      entityType: item.entityType,
      entityId: item.entityId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  }

  const legacyNotifications = await db.collection('notifications').find({ userId: { $exists: true }, recipient: { $exists: false } }).toArray();
  for (const item of legacyNotifications) {
    await db.collection('notifications').updateOne(
      { _id: item._id },
      {
        $set: {
          recipient: {
            audience: 'customer',
            userId: item.userId,
          },
          message: item.message ?? '',
          category: item.category ?? 'system',
        },
      },
    );
  }
}

async function dropLegacyCollections(db: mongoose.mongo.Db) {
  const legacy = ['vendors', 'drivers', 'admins', 'adminnotifications'];
  for (const name of legacy) {
    const exists = await db.listCollections({ name }).hasNext();
    if (exists) {
      await db.dropCollection(name);
      logger.info('Dropped legacy collection', { name });
    }
  }
}

async function main() {
  await connectDatabase();
  const db = mongoose.connection.db;
  if (!db) throw new Error('Database connection unavailable');

  logger.info('Starting unified users migration...');
  const vendorIdMap = await migrateVendors(db);
  await migrateDrivers(db, vendorIdMap);
  await migrateNotifications(db);
  await dropLegacyCollections(db);
  logger.info('Unified users migration completed');
  await disconnectDatabase();
}

main().catch(async (error) => {
  logger.error('Migration failed', { error });
  await disconnectDatabase();
  process.exit(1);
});
