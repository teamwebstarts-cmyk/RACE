import { Types } from 'mongoose';

import { BookingModel } from '../../bookings/booking.model';
import { UserModel } from '../../users/user.model';
import { VendorModel } from '../../vendors/vendor.model';
import { ActivityLogModel } from '../models/activity-log.model';
import { DriverModel } from '../models/driver.model';
import { TransactionModel } from '../models/transaction.model';
import { PlatformSettingsModel } from '../models/platform-settings.model';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function trend(current: number, previous: number) {
  if (previous === 0) {
    return { value: current > 0 ? '+100%' : '0%', direction: 'neutral' as const };
  }
  const pct = ((current - previous) / previous) * 100;
  const direction = pct > 0 ? ('up' as const) : pct < 0 ? ('down' as const) : ('neutral' as const);
  return { value: `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`, direction, label: 'vs last month' };
}

function monthRange(offsetMonths: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - offsetMonths, 1);
  const end = new Date(now.getFullYear(), now.getMonth() - offsetMonths + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

export const adminDashboardService = {
  async getDashboard() {
    const settings = await PlatformSettingsModel.findOne().lean();
    const commissionRate = settings?.commissionRate ?? 12.5;

    const currentMonth = monthRange(0);
    const previousMonth = monthRange(1);

    const [
      totalCustomers,
      totalVendors,
      totalDrivers,
      totalBookings,
      activeBookings,
      completedBookings,
      pendingVendors,
      pendingDrivers,
      revenueAgg,
      commissionAgg,
      prevCustomers,
      prevVendors,
      prevDrivers,
      prevBookings,
      prevRevenueAgg,
      revenueByWeek,
      bookingsByWeek,
      serviceDistribution,
      recentActivities,
      recentBookings,
      recentVendors,
    ] = await Promise.all([
      UserModel.countDocuments({ role: 'customer' }),
      VendorModel.countDocuments(),
      DriverModel.countDocuments(),
      BookingModel.countDocuments(),
      BookingModel.countDocuments({
        status: { $in: ['CREATED', 'ASSIGNED', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'SERVICE_STARTED'] },
      }),
      BookingModel.countDocuments({ status: { $in: ['SERVICE_COMPLETED', 'PAID'] } }),
      VendorModel.countDocuments({ status: { $in: ['pending', 'under_review'] } }),
      DriverModel.countDocuments({ status: 'PENDING' }),
      TransactionModel.aggregate([
        { $match: { type: 'PAYMENT', status: 'COMPLETED' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      TransactionModel.aggregate([
        { $match: { type: 'COMMISSION', status: 'COMPLETED' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      UserModel.countDocuments({
        role: 'customer',
        createdAt: { $gte: previousMonth.start, $lte: previousMonth.end },
      }),
      VendorModel.countDocuments({
        createdAt: { $gte: previousMonth.start, $lte: previousMonth.end },
      }),
      DriverModel.countDocuments({
        createdAt: { $gte: previousMonth.start, $lte: previousMonth.end },
      }),
      BookingModel.countDocuments({
        createdAt: { $gte: previousMonth.start, $lte: previousMonth.end },
      }),
      TransactionModel.aggregate([
        {
          $match: {
            type: 'PAYMENT',
            status: 'COMPLETED',
            createdAt: { $gte: previousMonth.start, $lte: previousMonth.end },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      TransactionModel.aggregate([
        {
          $match: {
            type: 'PAYMENT',
            status: 'COMPLETED',
            createdAt: { $gte: currentMonth.start, $lte: currentMonth.end },
          },
        },
        {
          $group: {
            _id: { $week: '$createdAt' },
            total: { $sum: '$amount' },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 4 },
      ]),
      BookingModel.aggregate([
        { $match: { createdAt: { $gte: currentMonth.start, $lte: currentMonth.end } } },
        { $group: { _id: { $week: '$createdAt' }, total: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $limit: 4 },
      ]),
      BookingModel.aggregate([
        { $group: { _id: '$serviceLabel', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      ActivityLogModel.find().sort({ createdAt: -1 }).limit(8).lean(),
      BookingModel.find().sort({ createdAt: -1 }).limit(6).populate('customerId', 'fullName').lean(),
      VendorModel.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    const totalRevenue = revenueAgg[0]?.total ?? 0;
    const totalCommission = commissionAgg[0]?.total ?? 0;
    const prevRevenue = prevRevenueAgg[0]?.total ?? 0;

    const currentMonthCustomers = await UserModel.countDocuments({
      role: 'customer',
      createdAt: { $gte: currentMonth.start, $lte: currentMonth.end },
    });
    const currentMonthVendors = await VendorModel.countDocuments({
      createdAt: { $gte: currentMonth.start, $lte: currentMonth.end },
    });
    const currentMonthDrivers = await DriverModel.countDocuments({
      createdAt: { $gte: currentMonth.start, $lte: currentMonth.end },
    });
    const currentMonthBookings = await BookingModel.countDocuments({
      createdAt: { $gte: currentMonth.start, $lte: currentMonth.end },
    });
    const currentMonthRevenueAgg = await TransactionModel.aggregate([
      {
        $match: {
          type: 'PAYMENT',
          status: 'COMPLETED',
          createdAt: { $gte: currentMonth.start, $lte: currentMonth.end },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const currentMonthRevenue = currentMonthRevenueAgg[0]?.total ?? 0;

    const colors = ['#F5A623', '#2563EB', '#16A34A', '#DC2626', '#7C3AED'];

    return {
      stats: [
        {
          id: 'customers',
          label: 'Total Customers',
          value: totalCustomers,
          trend: trend(currentMonthCustomers, prevCustomers),
          icon: 'Users',
        },
        {
          id: 'vendors',
          label: 'Total Vendors',
          value: totalVendors,
          trend: trend(currentMonthVendors, prevVendors),
          icon: 'Building2',
        },
        {
          id: 'drivers',
          label: 'Total Drivers',
          value: totalDrivers,
          trend: trend(currentMonthDrivers, prevDrivers),
          icon: 'Car',
        },
        {
          id: 'active_bookings',
          label: 'Active Bookings',
          value: activeBookings,
          trend: trend(currentMonthBookings, prevBookings),
          icon: 'ClipboardList',
        },
        {
          id: 'total_bookings',
          label: 'Total Bookings',
          value: totalBookings,
          icon: 'List',
        },
        {
          id: 'completed_bookings',
          label: 'Completed Bookings',
          value: completedBookings,
          icon: 'CheckCircle2',
        },
        {
          id: 'revenue',
          label: 'Total Revenue',
          value: formatCurrency(totalRevenue),
          trend: trend(currentMonthRevenue, prevRevenue),
          icon: 'IndianRupee',
        },
        {
          id: 'commission',
          label: 'Platform Commission',
          value: formatCurrency(totalCommission || Math.round(totalRevenue * (commissionRate / 100))),
          icon: 'Percent',
        },
        {
          id: 'pending_vendors',
          label: 'Pending Vendor Approvals',
          value: pendingVendors,
          variant: 'warning',
          icon: 'Hourglass',
        },
        {
          id: 'pending_drivers',
          label: 'Pending Driver Approvals',
          value: pendingDrivers,
          variant: 'warning',
          icon: 'Hourglass',
        },
      ],
      revenueChart: revenueByWeek.map((row, i) => ({
        label: `Week ${i + 1}`,
        current: row.total,
        previous: Math.round(row.total * 0.9),
      })),
      bookingsChart: bookingsByWeek.map((row, i) => ({
        label: `Week ${i + 1}`,
        current: row.total,
        previous: Math.max(0, row.total - 20),
      })),
      topServices: serviceDistribution.map((row, i) => ({
        name: row._id ?? 'Other',
        value: row.count,
        color: colors[i % colors.length],
      })),
      recentActivities: recentActivities.map((log) => ({
        id: log._id.toString(),
        title: log.title,
        description: log.description,
        timestamp: log.createdAt.toISOString(),
        type: mapActivityType(log.entityType),
      })),
      recentBookings: await Promise.all(
        recentBookings.map(async (booking) => {
          const customer = booking.customerId as { fullName?: string } | Types.ObjectId;
          const customerName =
            customer && typeof customer === 'object' && 'fullName' in customer
              ? customer.fullName ?? 'Customer'
              : 'Customer';
          return {
            id: booking._id.toString(),
            bookingNumber: booking.bookingNumber,
            customerName,
            service: booking.serviceLabel,
            status: booking.status,
            amount: booking.invoice?.total ?? 0,
            createdAt: booking.createdAt.toISOString(),
          };
        }),
      ),
      recentVendors: recentVendors.map((vendor) => ({
        id: vendor._id.toString(),
        name: vendor.businessName ?? vendor.ownerName ?? 'Vendor',
        type: vendor.vendorType,
        status: mapVendorStatus(vendor.status),
        submittedAt: (vendor.submittedAt ?? vendor.createdAt).toISOString(),
        city: vendor.address?.split(',')[0] ?? 'Odisha',
      })),
    };
  },
};

function mapActivityType(entityType: string) {
  if (entityType.includes('vendor')) return 'vendor';
  if (entityType.includes('driver')) return 'driver';
  if (entityType.includes('booking')) return 'booking';
  if (entityType.includes('transaction') || entityType.includes('payment')) return 'payment';
  if (entityType.includes('customer') || entityType.includes('user')) return 'customer';
  return 'system';
}

function mapVendorStatus(status: string) {
  switch (status) {
    case 'approved':
      return 'APPROVED';
    case 'rejected':
      return 'REJECTED';
    case 'pending':
    case 'under_review':
      return 'PENDING';
    default:
      return 'PENDING';
  }
}
