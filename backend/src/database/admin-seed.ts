import bcrypt from 'bcryptjs';

import { BookingModel } from '../modules/bookings/booking.model';
import { UserModel } from '../modules/users/user.model';
import { VehicleModel } from '../modules/vehicles/vehicle.model';
import { VendorModel } from '../modules/vendors/vendor.model';
import {
  SubscriptionPlanModel,
  UserSubscriptionModel,
} from '../modules/subscriptions/subscription.model';
import { AdminModel } from '../modules/admin/models/admin.model';
import { DriverModel } from '../modules/admin/models/driver.model';
import { TransactionModel } from '../modules/admin/models/transaction.model';
import { PlatformSettingsModel } from '../modules/admin/models/platform-settings.model';
import { AdminNotificationModel } from '../modules/admin/models/admin-notification.model';
import { ActivityLogModel } from '../modules/admin/models/activity-log.model';
import { AdminRole, getPermissionsForRole } from '../modules/admin/shared/rbac';
import { logger } from '../shared/utils/logger';

const CITIES = ['Bhubaneswar', 'Cuttack', 'Puri', 'Rourkela', 'Berhampur'];
const SERVICES = ['Towing Service', 'Roadside Assistance', 'Battery Jump Start', 'Flat Tyre Repair', 'Fuel Delivery'];
const STATUSES = ['CREATED', 'ASSIGNED', 'EN_ROUTE', 'SERVICE_COMPLETED', 'PAID'] as const;

const CUSTOMER_PLANS = [
  {
    slug: 'customer-basic',
    name: 'Basic Towing',
    category: 'towing' as const,
    price: 299,
    billingCycle: 'monthly' as const,
    features: [
      { text: '2 roadside assists per month', included: true },
      { text: '24/7 support', included: true },
    ],
    isMostPopular: false,
  },
  {
    slug: 'customer-plus',
    name: 'Plus Care',
    category: 'towing' as const,
    price: 599,
    billingCycle: 'monthly' as const,
    features: [
      { text: '5 roadside assists per month', included: true },
      { text: 'Priority dispatch', included: true },
    ],
    isMostPopular: true,
  },
  {
    slug: 'customer-annual',
    name: 'Annual Shield',
    category: 'towing' as const,
    price: 4999,
    billingCycle: 'yearly' as const,
    features: [
      { text: 'Unlimited towing within city', included: true },
      { text: 'Family vehicle coverage', included: true },
    ],
    isMostPopular: false,
  },
];

const VENDOR_PLANS = [
  {
    slug: 'vendor-starter',
    name: 'Partner Starter',
    category: 'driver' as const,
    price: 999,
    billingCycle: 'monthly' as const,
    features: [
      { text: 'Up to 3 drivers', included: true },
      { text: 'Basic analytics', included: true },
    ],
    isMostPopular: false,
  },
  {
    slug: 'vendor-pro',
    name: 'Partner Pro',
    category: 'driver' as const,
    price: 2499,
    billingCycle: 'monthly' as const,
    features: [
      { text: 'Up to 15 drivers', included: true },
      { text: 'Priority listing', included: true },
    ],
    isMostPopular: true,
  },
  {
    slug: 'vendor-enterprise',
    name: 'Enterprise Fleet',
    category: 'driver' as const,
    price: 19999,
    billingCycle: 'yearly' as const,
    features: [
      { text: 'Unlimited drivers', included: true },
      { text: 'Dedicated account manager', included: true },
    ],
    isMostPopular: false,
  },
];

export async function seedAdminPlatform(): Promise<void> {
  logger.info('Clearing admin platform collections...');

  await Promise.all([
    AdminModel.deleteMany({}),
    DriverModel.deleteMany({}),
    TransactionModel.deleteMany({}),
    AdminNotificationModel.deleteMany({}),
    ActivityLogModel.deleteMany({}),
    BookingModel.deleteMany({}),
    VehicleModel.deleteMany({}),
    VendorModel.deleteMany({}),
    UserSubscriptionModel.deleteMany({}),
    SubscriptionPlanModel.deleteMany({}),
    UserModel.deleteMany({ role: { $in: ['customer', 'vendor'] } }),
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

  const passwordHash = await bcrypt.hash('Admin@123', 12);
  const superAdmin = await AdminModel.create({
    name: 'Admin User',
    email: 'admin@raceservice.com',
    passwordHash,
    role: AdminRole.SUPER_ADMIN,
    permissions: getPermissionsForRole(AdminRole.SUPER_ADMIN),
    isActive: true,
    lastLoginAt: new Date(),
  });

  const extraAdmins = await AdminModel.insertMany([
    {
      name: 'Operations Lead',
      email: 'ops@raceservice.com',
      passwordHash,
      role: AdminRole.OPERATIONS_ADMIN,
      permissions: getPermissionsForRole(AdminRole.OPERATIONS_ADMIN),
      isActive: true,
      lastLoginAt: new Date(Date.now() - 86400000),
    },
    {
      name: 'Finance Manager',
      email: 'finance@raceservice.com',
      passwordHash,
      role: AdminRole.FINANCE_ADMIN,
      permissions: getPermissionsForRole(AdminRole.FINANCE_ADMIN),
      isActive: true,
      lastLoginAt: new Date(Date.now() - 172800000),
    },
    {
      name: 'Support Agent',
      email: 'support@raceservice.com',
      passwordHash,
      role: AdminRole.SUPPORT_ADMIN,
      permissions: getPermissionsForRole(AdminRole.SUPPORT_ADMIN),
      isActive: true,
      lastLoginAt: new Date(Date.now() - 3600000),
    },
  ]);

  const customers = [];
  for (let i = 0; i < 20; i++) {
    const customer = await UserModel.create({
      mobileNumber: `98765${String(43210 + i).padStart(5, '0')}`,
      fullName: `Customer ${i + 1}`,
      email: `customer${i + 1}@example.com`,
      role: 'customer',
      isVerified: true,
      isProfileCompleted: true,
      accountStatus: i % 7 === 0 ? 'SUSPENDED' : 'ACTIVE',
      customerCode: `CUST${String(i + 1).padStart(4, '0')}`,
      address: { city: CITIES[i % CITIES.length], state: 'Odisha', country: 'India' },
    });
    customers.push(customer);

    await VehicleModel.create({
      customerId: customer._id,
      vehicleType: 'car',
      vehicleNumber: `OD-0${(i % 9) + 1}-AB-${1000 + i}`,
      brand: 'Maruti',
      vehicleModel: 'Swift',
      fuelType: 'petrol',
      qrCode: `QR-CUST-${i + 1}`,
    });
  }

  const vendors = [];
  for (let i = 0; i < 5; i++) {
    const vendorUser = await UserModel.create({
      mobileNumber: `98123${String(45670 + i).padStart(5, '0')}`,
      fullName: `Vendor Owner ${i + 1}`,
      email: `vendor${i + 1}@business.com`,
      role: 'vendor',
      isVerified: true,
      isProfileCompleted: true,
    });

    const vendor = await VendorModel.create({
      userId: vendorUser._id,
      vendorType: i % 2 === 0 ? 'towing_company' : 'tow_truck_driver',
      status: i === 2 ? 'pending' : 'approved',
      verificationStage: i === 2 ? 'document_review' : 'approved',
      businessName: `RACE Partner ${i + 1}`,
      ownerName: vendorUser.fullName,
      mobileNumber: vendorUser.mobileNumber,
      email: vendorUser.email,
      address: `${CITIES[i % CITIES.length]}, Odisha`,
      submittedAt: new Date(),
      approvedAt: i === 2 ? undefined : new Date(),
      statusHistory: [{ status: 'approved', changedAt: new Date() }],
    });
    vendors.push(vendor);
  }

  const drivers = [];
  for (let i = 0; i < 10; i++) {
    const driver = await DriverModel.create({
      driverCode: `DRV${String(i + 1).padStart(4, '0')}`,
      name: `Driver ${i + 1}`,
      phone: `98989${String(10000 + i).padStart(5, '0')}`,
      email: `driver${i + 1}@example.com`,
      licenseNo: `OD${20240000 + i}`,
      driverType: i % 2 === 0 ? 'Tow Driver' : 'Full-Time',
      vendorId: vendors[i % vendors.length]._id,
      city: CITIES[i % CITIES.length],
      state: 'Odisha',
      vehicleRegistration: `OD-DRV-${1000 + i}`,
      rating: 4 + (i % 10) / 10,
      reviewCount: 10 + i * 3,
      status: i === 3 ? 'PENDING' : 'APPROVED',
      totalTrips: i * 12,
      statusHistory: [{ status: i === 3 ? 'PENDING' : 'APPROVED', changedAt: new Date() }],
    });
    drivers.push(driver);
  }

  for (let i = 0; i < 50; i++) {
    const customer = customers[i % customers.length];
    const vehicle = await VehicleModel.findOne({ customerId: customer._id });
    const status = STATUSES[i % STATUSES.length];
    const amount = 500 + (i % 20) * 150;

    await BookingModel.create({
      customerId: customer._id,
      bookingNumber: `BK${1000 + i}${String.fromCharCode(65 + (i % 26))}`,
      categoryId: 'towing',
      serviceId: 'towing-standard',
      serviceLabel: SERVICES[i % SERVICES.length],
      status,
      vehicleId: vehicle!._id,
      vehicleNumber: vehicle!.vehicleNumber,
      pickup: { label: CITIES[i % CITIES.length], address: `${CITIES[i % CITIES.length]}, Odisha` },
      driver: {
        id: drivers[i % drivers.length]._id.toString(),
        name: drivers[i % drivers.length].name,
        rating: drivers[i % drivers.length].rating,
        phone: drivers[i % drivers.length].phone,
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
      vendorId: vendors[i % vendors.length]._id,
      description: `${type} transaction`,
      reference: `REF-${i + 1}`,
      completedAt: new Date(Date.now() - i * 43200000),
      createdAt: new Date(Date.now() - i * 43200000),
    });
  }

  const subscriptionPlans = await SubscriptionPlanModel.insertMany(
    [...CUSTOMER_PLANS, ...VENDOR_PLANS].map((plan) => ({
      ...plan,
      currency: 'INR',
      actionType: 'purchase' as const,
      isActive: true,
    })),
  );

  for (let i = 0; i < 18; i++) {
    const customer = customers[i % customers.length];
    const plan = subscriptionPlans[i % subscriptionPlans.length];
    const startedAt = new Date(Date.now() - (i + 1) * 7 * 86400000);
    const expiresAt = new Date(
      startedAt.getTime() + (plan.billingCycle === 'monthly' ? 30 : 365) * 86400000,
    );

    await UserSubscriptionModel.create({
      userId: customer._id,
      planId: plan._id,
      planSlug: plan.slug,
      planName: plan.name,
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

  await AdminNotificationModel.insertMany([
    {
      title: 'New vendor registration',
      message: 'RACE Partner 3 is awaiting verification review.',
      type: 'info',
      category: 'vendor',
      isRead: false,
    },
    {
      title: 'Booking surge detected',
      message: 'Booking volume is 20% above average today.',
      type: 'warning',
      category: 'booking',
      isRead: false,
    },
    {
      title: 'Payout batch ready',
      message: '12 vendor payouts are ready for approval.',
      type: 'success',
      category: 'payment',
      isRead: true,
    },
    {
      title: 'Driver document expired',
      message: 'Driver DRV0004 license renewal is due.',
      type: 'warning',
      category: 'driver',
      isRead: false,
    },
    {
      title: 'New subscription',
      message: 'Customer subscribed to Plus Care plan.',
      type: 'info',
      category: 'customer',
      isRead: false,
    },
    {
      title: 'Refund processed',
      message: 'Refund TXN000042 completed successfully.',
      type: 'success',
      category: 'payment',
      isRead: true,
    },
    {
      title: 'Customer account suspended',
      message: 'Customer CUST0007 was suspended by operations.',
      type: 'error',
      category: 'customer',
      isRead: false,
    },
    {
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
      actorId: index % 2 === 0 ? superAdmin._id : extraAdmins[index % extraAdmins.length]._id,
      actorName: index % 2 === 0 ? superAdmin.name : extraAdmins[index % extraAdmins.length].name,
      ...entry,
      createdAt: new Date(Date.now() - index * 3600000),
    })),
  );

  await ActivityLogModel.create({
    actorId: superAdmin._id,
    actorName: superAdmin.name,
    action: 'SEED_COMPLETED',
    entityType: 'system',
    title: 'Development database seeded',
    description: 'All admin collections cleared and re-seeded into MongoDB (race-service)',
  });

  logger.info('Admin platform seed completed', {
    superAdmin: superAdmin.email,
    admins: 1 + extraAdmins.length,
    customers: customers.length,
    vendors: vendors.length,
    drivers: drivers.length,
    bookings: 50,
    transactions: 100,
    subscriptionPlans: subscriptionPlans.length,
    userSubscriptions: 18,
    notifications: 8,
    activityLogs: activityEntries.length + 1,
  });
}
