import { BookingModel } from '../../models/src/booking';
import { PLATFORM_ADMIN_ID, getPlatformAdmin } from '../../config/hardcoded-admin';
import { UserModel, type IUser } from '../../models/src/user';
import { VehicleModel } from '../../models/src/vehicle';
import { driverRepository } from '../../services/src/driverRepository';
import { vendorRepository } from '../../services/src/vendorRepository';
import {
  SubscriptionPlanModel,
  UserSubscriptionModel,
} from '../../models/src/subscription';
import { DEFAULT_PLANS } from '../../services/src/subscription';
import { TransactionModel } from '../../models/src/transaction';
import { PlatformSettingsModel } from '../../models/src/platformSettings';
import { NotificationModel } from '../../models/src/notification';
import { ActivityLogModel } from '../../models/src/activityLog';
import { logger } from '../../utils/src/logger';

const CITIES = ['Bhubaneswar', 'Cuttack', 'Puri', 'Rourkela', 'Berhampur'];
const SERVICES = ['Towing Service', 'Roadside Assistance', 'Battery Jump Start', 'Flat Tyre Repair', 'Fuel Delivery'];
const STATUSES = ['CREATED', 'ASSIGNED', 'EN_ROUTE', 'SERVICE_COMPLETED', 'PAID'] as const;

export async function seedAdminPlatform(): Promise<void> {
  logger.info('Clearing admin platform collections...');

  await Promise.all([
    TransactionModel.deleteMany({}),
    NotificationModel.deleteMany({}),
    ActivityLogModel.deleteMany({}),
    BookingModel.deleteMany({ bookingNumber: { $regex: /^BK100/ } }),
    VehicleModel.deleteMany({
      $or: [
        { qrCode: { $regex: /^QR-CUST-/ } },
        { vehicleNumber: { $regex: /^OD-0[1-9]-AB-/ } },
      ],
    }),
    UserSubscriptionModel.deleteMany({}),
    SubscriptionPlanModel.deleteMany({}),
    UserModel.deleteMany({
      role: 'customer',
      $or: [
        { mobileNumber: { $regex: /^(\+91)?9876543/ } },
        { email: { $regex: /^customer\d+@example\.com$/ } },
        { fullName: { $regex: /^Customer \d+$/ } },
      ],
    }),
    UserModel.deleteMany({ role: { $in: ['vendor', 'driver'] } }),
  ]);

  logger.info('Seeding admin platform data...');

  await PlatformSettingsModel.findOneAndUpdate(
    {},
    {
      platformName: 'RACE Service',
      supportEmail: 'support@raceservice.com',
      commissionRate: 12.5,
      bookingRadiusKm: 50,
      timezone: 'Asia/Kolkata',
      language: 'en',
      autoPayout: false,
    },
    { upsert: true },
  );

  const platformAdmin = getPlatformAdmin();

  const customers: IUser[] = [];

  const vendors = [];
  for (let i = 0; i < 5; i++) {
    const vendor = await vendorRepository.create({
      vendorType: i % 2 === 0 ? 'towing_company' : 'tow_truck_driver',
      status: i === 2 ? 'pending' : 'approved',
      verificationStage: i === 2 ? 'document_review' : 'approved',
      businessName: `RACE Partner ${i + 1}`,
      ownerName: `Vendor Owner ${i + 1}`,
      mobileNumber: `98123${String(45670 + i).padStart(5, '0')}`,
      email: `vendor${i + 1}@business.com`,
      address: `${CITIES[i % CITIES.length]}, Odisha`,
      submittedAt: new Date(),
      approvedAt: i === 2 ? undefined : new Date(),
      statusHistory: [{ status: 'approved', changedAt: new Date() }],
    });

    const vendorUser = await UserModel.findById(vendor.id);
    if (vendorUser?.vendorProfile) {
      vendorUser.vendorProfile.bankDetails = {
        accountHolderName: vendor.ownerName ?? '',
        accountNumber: `XXXX${String(1000 + i).slice(-4)}`,
        ifsc: 'HDFC0001234',
        bankName: 'HDFC Bank',
      };
      vendorUser.vendorProfile.towVehicle = {
        registrationNumber: `OD-VND-${1000 + i}`,
        vehicleType: 'Tow Truck',
        capacity: '3 Ton',
      };
      await vendorUser.save();
    }

    vendors.push(vendor);
  }

  const drivers = [];
  for (let i = 0; i < 10; i++) {
    const driver = await driverRepository.create({
      driverCode: `DRV${String(i + 1).padStart(4, '0')}`,
      fullName: `Driver ${i + 1}`,
      mobileNumber: `98989${String(10000 + i).padStart(5, '0')}`,
      email: `driver${i + 1}@example.com`,
      licenseNo: `OD${20240000 + i}`,
      driverType: i % 2 === 0 ? 'Tow Driver' : 'Full-Time',
      vendorUserId: vendors[i % vendors.length].id,
      city: CITIES[i % CITIES.length],
      state: 'Odisha',
      vehicleRegistration: `OD-DRV-${1000 + i}`,
      status: i === 3 ? 'PENDING' : 'APPROVED',
      statusHistory: [{ status: i === 3 ? 'PENDING' : 'APPROVED', changedAt: new Date() }],
    });

    const driverUser = await UserModel.findById(driver.id);
    if (driverUser?.driverProfile) {
      driverUser.driverProfile.rating = 4 + (i % 10) / 10;
      driverUser.driverProfile.reviewCount = 10 + i * 3;
      driverUser.driverProfile.totalTrips = i * 12;
      driverUser.driverProfile.documents = [
        {
          type: 'Driving License',
          url: `/documents/driver/${i + 1}/dl.pdf`,
          status: i === 3 ? 'PENDING' : 'VERIFIED',
          uploadedAt: new Date(),
        },
        {
          type: 'Aadhaar Card',
          url: `/documents/driver/${i + 1}/aadhaar.pdf`,
          status: i === 3 ? 'PENDING' : 'VERIFIED',
          uploadedAt: new Date(),
        },
        {
          type: 'Police Verification',
          url: `/documents/driver/${i + 1}/police.pdf`,
          status: i === 3 ? 'PENDING' : 'VERIFIED',
          uploadedAt: new Date(),
        },
        {
          type: 'Medical Fitness Certificate',
          url: `/documents/driver/${i + 1}/medical.pdf`,
          status: i === 3 ? 'PENDING' : 'VERIFIED',
          uploadedAt: new Date(),
        },
      ];
      await driverUser.save();
    }

    drivers.push(driver);
  }

  if (customers.length > 0) {
    for (let i = 0; i < 50; i++) {
      const customer = customers[i % customers.length];
      const vehicle = await VehicleModel.findOne({ customerId: customer._id });
      const status = STATUSES[i % STATUSES.length];
      const amount = 500 + (i % 20) * 150;
      const assignedDriver = drivers[i % drivers.length];

      await BookingModel.create({
        customerId: customer._id,
        vendorId: assignedDriver.vendorId as never,
        bookingNumber: `BK${1000 + i}${String.fromCharCode(65 + (i % 26))}`,
        categoryId: 'towing',
        serviceId: 'towing-standard',
        serviceLabel: SERVICES[i % SERVICES.length],
        status,
        vehicleId: vehicle!._id,
        vehicleNumber: vehicle!.vehicleNumber,
        pickup: { label: CITIES[i % CITIES.length], address: `${CITIES[i % CITIES.length]}, Odisha` },
        driver: {
          id: assignedDriver.id,
          name: assignedDriver.name,
          rating: assignedDriver.rating,
          phone: assignedDriver.phone,
        },
        invoice: { baseFare: amount, total: amount, currency: 'INR', platformFee: Math.round(amount * 0.125) },
        statusHistory: [{ status, timestamp: new Date(Date.now() - i * 86400000) }],
        createdAt: new Date(Date.now() - i * 86400000),
      });
    }

    for (let i = 0; i < 100; i++) {
      const amount = 300 + (i % 50) * 100;
      const types = ['PAYMENT', 'COMMISSION', 'VENDOR_PAYOUT', 'REFUND', 'SUBSCRIPTION'] as const;
      const type = types[i % types.length];
      await TransactionModel.create({
        transactionCode: `TXN${String(i + 1).padStart(6, '0')}`,
        type,
        status: 'COMPLETED',
        amount,
        currency: 'INR',
        customerId: customers[i % customers.length]._id,
        vendorId: vendors[i % vendors.length].id as never,
        description: `${type} transaction`,
        reference: `REF-${i + 1}`,
        completedAt: new Date(Date.now() - i * 43200000),
        createdAt: new Date(Date.now() - i * 43200000),
      });
    }
  }

  const subscriptionPlans = await SubscriptionPlanModel.insertMany(
    DEFAULT_PLANS.map((plan) => ({
      ...plan,
      currency: 'INR',
      isActive: true,
    })),
  );

  if (customers.length > 0) {
    for (let i = 0; i < 18; i++) {
      const customer = customers[i % customers.length];
      const customerPlans = subscriptionPlans.filter((p) => p.audience === 'customer');
      const plan = customerPlans[i % customerPlans.length] ?? subscriptionPlans[0];
      const startedAt = new Date(Date.now() - (i + 1) * 7 * 86400000);
      const expiresAt = new Date(
        startedAt.getTime() + (plan.billingCycle === 'monthly' ? 30 : 365) * 86400000,
      );

      await UserSubscriptionModel.create({
        userId: customer._id,
        planId: plan._id,
        planSlug: plan.slug,
        planName: plan.name,
        audience: plan.audience,
        category: plan.category,
        billingCycle: plan.billingCycle,
        price: plan.price,
        currency: 'INR',
        status: i % 5 === 0 ? 'cancelled' : 'active',
        startedAt,
        expiresAt,
        cancelledAt: i % 5 === 0 ? new Date() : undefined,
      });
    }
  }

  await NotificationModel.insertMany([
    {
      recipient: { audience: 'admin' },
      title: 'New vendor registration',
      message: 'RACE Partner 3 is awaiting verification review.',
      type: 'info',
      category: 'vendor',
      isRead: false,
    },
    {
      recipient: { audience: 'admin' },
      title: 'Booking surge detected',
      message: 'Booking volume is 20% above average today.',
      type: 'warning',
      category: 'booking',
      isRead: false,
    },
    {
      recipient: { audience: 'admin' },
      title: 'Payout batch ready',
      message: '12 vendor payouts are ready for approval.',
      type: 'success',
      category: 'payment',
      isRead: true,
    },
    {
      recipient: { audience: 'admin' },
      title: 'Driver document expired',
      message: 'Driver DRV0004 license renewal is due.',
      type: 'warning',
      category: 'driver',
      isRead: false,
    },
    {
      recipient: { audience: 'admin' },
      title: 'New subscription',
      message: 'Customer subscribed to Plus Care plan.',
      type: 'info',
      category: 'customer',
      isRead: false,
    },
    {
      recipient: { audience: 'admin' },
      title: 'Refund processed',
      message: 'Refund TXN000042 completed successfully.',
      type: 'success',
      category: 'payment',
      isRead: true,
    },
    {
      recipient: { audience: 'admin' },
      title: 'Customer account suspended',
      message: 'Customer CUST0007 was suspended by operations.',
      type: 'error',
      category: 'customer',
      isRead: false,
    },
    {
      recipient: { audience: 'admin' },
      title: 'Weekly report available',
      message: 'Platform performance report for last week is ready.',
      type: 'info',
      category: 'system',
      isRead: true,
    },
  ]);

  const activityEntries = [
    { action: 'LOGIN', entityType: 'admin', title: 'Admin signed in', description: 'Super admin logged into dashboard' },
    { action: 'VENDOR_APPROVED', entityType: 'vendor', title: 'Vendor approved', description: 'RACE Partner 1 approved' },
    { action: 'BOOKING_CREATED', entityType: 'booking', title: 'Booking created', description: 'New towing booking BK1000A' },
    { action: 'DRIVER_UPDATED', entityType: 'driver', title: 'Driver profile updated', description: 'Driver DRV0002 details changed' },
    { action: 'SETTINGS_UPDATED', entityType: 'settings', title: 'Platform settings updated', description: 'Commission rate adjusted' },
    { action: 'CUSTOMER_SUSPENDED', entityType: 'customer', title: 'Customer suspended', description: 'Customer CUST0007 suspended' },
    { action: 'PAYOUT_APPROVED', entityType: 'finance', title: 'Vendor payout approved', description: 'Payout batch #12 approved' },
    { action: 'SUBSCRIPTION_CREATED', entityType: 'subscription', title: 'New subscription', description: 'Plus Care plan activated' },
    { action: 'REPORT_EXPORTED', entityType: 'report', title: 'Report exported', description: 'Weekly revenue report downloaded' },
    { action: 'NOTIFICATION_SENT', entityType: 'notification', title: 'Bulk notification sent', description: 'Promo sent to 200 customers' },
  ];

  await ActivityLogModel.insertMany(
    activityEntries.map((entry, index) => ({
      actorId: PLATFORM_ADMIN_ID,
      actorName: platformAdmin.name,
      ...entry,
      createdAt: new Date(Date.now() - index * 3600000),
    })),
  );

  await ActivityLogModel.create({
    actorId: PLATFORM_ADMIN_ID,
    actorName: platformAdmin.name,
    action: 'SEED_COMPLETED',
    entityType: 'system',
    title: 'Development database seeded',
    description: 'Unified users collection seeded into MongoDB (race)',
  });

  logger.info('Admin platform seed completed', {
    superAdmin: platformAdmin.email,
    admins: 1,
    customers: customers.length,
    vendors: vendors.length,
    drivers: drivers.length,
    bookings: customers.length > 0 ? 50 : 0,
    transactions: customers.length > 0 ? 100 : 0,
    subscriptionPlans: subscriptionPlans.length,
    userSubscriptions: customers.length > 0 ? 18 : 0,
    notifications: 8,
    activityLogs: activityEntries.length + 1,
  });
}
