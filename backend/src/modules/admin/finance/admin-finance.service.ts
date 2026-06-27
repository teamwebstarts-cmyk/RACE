import { TransactionModel } from '../models/transaction.model';
import { escapeRegex, paginate } from '../shared/pagination';

export const adminFinanceService = {
  async listTransactions(filters: Record<string, string | number | undefined>) {
    const query: Record<string, unknown> = {};
    if (filters.type && filters.type !== 'ALL') query.type = filters.type;
    if (filters.status && filters.status !== 'ALL') query.status = filters.status;
    if (filters.search) {
      const regex = new RegExp(escapeRegex(String(filters.search)), 'i');
      query.$or = [{ transactionCode: regex }, { reference: regex }, { description: regex }];
    }

    return paginate(TransactionModel, query, filters as never, (doc) => ({
      id: doc._id.toString(),
      transactionId: doc.transactionCode,
      type: doc.type,
      status: doc.status,
      amount: doc.amount,
      currency: doc.currency,
      description: doc.description ?? '',
      reference: doc.reference ?? '',
      date: doc.createdAt.toISOString(),
      from: doc.customerId?.toString() ?? '—',
      to: doc.vendorId?.toString() ?? '—',
    }));
  },

  async getSummary() {
    const [revenue, commission, refunds, payouts, pending] = await Promise.all([
      TransactionModel.aggregate([
        { $match: { type: 'PAYMENT', status: 'COMPLETED' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      TransactionModel.aggregate([
        { $match: { type: 'COMMISSION', status: 'COMPLETED' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      TransactionModel.aggregate([
        { $match: { type: 'REFUND', status: 'COMPLETED' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      TransactionModel.aggregate([
        { $match: { type: 'VENDOR_PAYOUT', status: 'COMPLETED' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      TransactionModel.aggregate([
        { $match: { type: 'VENDOR_PAYOUT', status: 'PENDING' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    return {
      totalRevenue: revenue[0]?.total ?? 0,
      totalCommission: commission[0]?.total ?? 0,
      totalRefunds: refunds[0]?.total ?? 0,
      totalPayouts: payouts[0]?.total ?? 0,
      pendingPayouts: pending[0]?.total ?? 0,
    };
  },
};
