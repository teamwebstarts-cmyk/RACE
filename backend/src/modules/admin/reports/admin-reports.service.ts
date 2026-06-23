import { BookingModel } from '../../bookings/booking.model';
import { UserModel } from '../../users/user.model';
import { VendorModel } from '../../vendors/vendor.model';
import { DriverModel } from '../models/driver.model';
import { TransactionModel } from '../models/transaction.model';

export const adminReportsService = {
  async getReports(dateFrom?: string, dateTo?: string) {
    const dateFilter: Record<string, Date> = {};
    if (dateFrom) dateFilter.$gte = new Date(dateFrom);
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      dateFilter.$lte = end;
    }
    const match = Object.keys(dateFilter).length ? { createdAt: dateFilter } : {};

    const [revenueTrend, bookingTrend, vendorGrowth, customerGrowth, serviceDistribution, topVendors, completionRate] =
      await Promise.all([
        TransactionModel.aggregate([
          { $match: { ...match, type: 'PAYMENT', status: 'COMPLETED' } },
          { $group: { _id: { $month: '$createdAt' }, revenue: { $sum: '$amount' } } },
          { $sort: { _id: 1 } },
        ]),
        BookingModel.aggregate([
          { $match: match },
          { $group: { _id: { $month: '$createdAt' }, bookings: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
        VendorModel.aggregate([
          { $match: match },
          { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
        UserModel.aggregate([
          { $match: { ...match, role: 'customer' } },
          { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
        BookingModel.aggregate([
          { $match: match },
          { $group: { _id: '$serviceLabel', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 6 },
        ]),
        VendorModel.find().sort({ createdAt: -1 }).limit(5).lean(),
        BookingModel.aggregate([
          { $match: match },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              completed: {
                $sum: { $cond: [{ $in: ['$status', ['SERVICE_COMPLETED', 'PAID']] }, 1, 0] },
              },
              cancelled: { $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] } },
            },
          },
        ]),
      ]);

    const rates = completionRate[0] ?? { total: 0, completed: 0, cancelled: 0 };

    return {
      revenueTrend: revenueTrend.map((r) => ({ label: `Month ${r._id}`, value: r.revenue })),
      bookingTrend: bookingTrend.map((b) => ({ label: `Month ${b._id}`, value: b.bookings })),
      vendorGrowth: vendorGrowth.map((v) => ({ label: `Month ${v._id}`, value: v.count })),
      customerGrowth: customerGrowth.map((c) => ({ label: `Month ${c._id}`, value: c.count })),
      serviceDistribution: serviceDistribution.map((s) => ({ name: s._id, value: s.count })),
      topVendors: topVendors.map((v) => ({
        id: v._id.toString(),
        name: v.businessName ?? v.ownerName ?? 'Vendor',
        bookings: 0,
        revenue: 0,
      })),
      topDrivers: await DriverModel.find().sort({ totalTrips: -1 }).limit(5).lean().then((drivers) =>
        drivers.map((d) => ({
          id: d._id.toString(),
          name: d.name,
          trips: d.totalTrips,
          rating: d.rating,
        })),
      ),
      completionRate: rates.total ? Math.round((rates.completed / rates.total) * 100) : 0,
      cancellationRate: rates.total ? Math.round((rates.cancelled / rates.total) * 100) : 0,
      summary: {
        totalRevenue: revenueTrend.reduce((sum, r) => sum + r.revenue, 0),
        totalBookings: bookingTrend.reduce((sum, b) => sum + b.bookings, 0),
        totalVendors: await VendorModel.countDocuments(match),
        totalCustomers: await UserModel.countDocuments({ ...match, role: 'customer' }),
      },
    };
  },
};
