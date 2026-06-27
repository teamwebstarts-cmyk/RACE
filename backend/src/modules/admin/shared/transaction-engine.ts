import { Types } from 'mongoose';

import { BookingModel } from '../../bookings/booking.model';
import { TransactionModel } from '../models/transaction.model';
import { PlatformSettingsModel } from '../models/platform-settings.model';
import { NotFoundError } from '../../../shared/utils/errors';

async function nextTransactionCode(): Promise<string> {
  const count = await TransactionModel.countDocuments();
  return `TXN${String(count + 1).padStart(6, '0')}`;
}

async function getCommissionRate(): Promise<number> {
  const settings = await PlatformSettingsModel.findOne().lean();
  return (settings?.commissionRate ?? 12.5) / 100;
}

export async function generateBookingFinancials(bookingId: string | Types.ObjectId): Promise<void> {
  const booking = await BookingModel.findById(bookingId);
  if (!booking) throw new NotFoundError('Booking not found');

  const total = booking.invoice?.total ?? 0;
  if (total <= 0) return;

  const existing = await TransactionModel.findOne({
    bookingId: booking._id,
    type: 'PAYMENT',
  });
  if (existing) return;

  const commissionRate = await getCommissionRate();
  const commission = Math.round(total * commissionRate);
  const vendorPayout = total - commission;
  const now = new Date();

  await TransactionModel.insertMany([
    {
      transactionCode: await nextTransactionCode(),
      type: 'PAYMENT',
      status: 'COMPLETED',
      amount: total,
      currency: booking.invoice?.currency ?? 'INR',
      customerId: booking.customerId,
      vendorId: booking.vendorId,
      driverId: booking.driver?.id ? new Types.ObjectId(booking.driver.id) : undefined,
      bookingId: booking._id,
      description: `Payment for booking ${booking.bookingNumber}`,
      reference: booking.bookingNumber,
      completedAt: now,
    },
    {
      transactionCode: await nextTransactionCode(),
      type: 'COMMISSION',
      status: 'COMPLETED',
      amount: commission,
      currency: booking.invoice?.currency ?? 'INR',
      vendorId: booking.vendorId,
      bookingId: booking._id,
      description: `Platform commission for ${booking.bookingNumber}`,
      reference: booking.bookingNumber,
      completedAt: now,
    },
    {
      transactionCode: await nextTransactionCode(),
      type: 'VENDOR_PAYOUT',
      status: 'PENDING',
      amount: vendorPayout,
      currency: booking.invoice?.currency ?? 'INR',
      vendorId: booking.vendorId,
      bookingId: booking._id,
      description: `Vendor payout for ${booking.bookingNumber}`,
      reference: booking.bookingNumber,
    },
  ]);
}

export async function generateRefund(
  bookingId: string | Types.ObjectId,
  amount?: number,
): Promise<void> {
  const booking = await BookingModel.findById(bookingId);
  if (!booking) throw new NotFoundError('Booking not found');

  const refundAmount = amount ?? booking.invoice?.total ?? 0;
  if (refundAmount <= 0) return;

  await TransactionModel.create({
    transactionCode: await nextTransactionCode(),
    type: 'REFUND',
    status: 'COMPLETED',
    amount: refundAmount,
    currency: booking.invoice?.currency ?? 'INR',
    customerId: booking.customerId,
    vendorId: booking.vendorId,
    bookingId: booking._id,
    description: `Refund for booking ${booking.bookingNumber}`,
    reference: booking.bookingNumber,
    completedAt: new Date(),
  });
}

export async function generateSubscriptionRevenue(
  subscriptionId: Types.ObjectId,
  customerId: Types.ObjectId,
  amount: number,
  planName: string,
): Promise<void> {
  await TransactionModel.create({
    transactionCode: await nextTransactionCode(),
    type: 'SUBSCRIPTION',
    status: 'COMPLETED',
    amount,
    currency: 'INR',
    customerId,
    subscriptionId,
    description: `Subscription: ${planName}`,
    completedAt: new Date(),
  });
}
