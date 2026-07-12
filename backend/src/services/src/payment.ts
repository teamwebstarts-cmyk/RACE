import { NotFoundError } from '../../utils/src/errors';
import { PaymentMethodModel, type IPaymentMethod } from '../../models/src/payment';
import { WalletModel } from '../../models/src/wallet';
import type {
  CreatePaymentMethodDto,
  PaymentMethodResponseDto,
  WalletResponseDto,
} from './paymentValidator';

function mapPaymentMethod(pm: IPaymentMethod): PaymentMethodResponseDto {
  return {
    id: pm.id,
    type: pm.type,
    label: pm.label,
    details: pm.details,
    isDefault: pm.isDefault,
    createdAt: pm.createdAt.toISOString(),
  };
}

export class PaymentService {
  async listMethods(userId: string): Promise<PaymentMethodResponseDto[]> {
    const methods = await PaymentMethodModel.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
    return methods.map(mapPaymentMethod);
  }

  async createMethod(userId: string, dto: CreatePaymentMethodDto): Promise<PaymentMethodResponseDto> {
    if (dto.isDefault) {
      await PaymentMethodModel.updateMany({ userId }, { isDefault: false });
    }

    const method = await PaymentMethodModel.create({ userId, ...dto });
    return mapPaymentMethod(method);
  }

  async removeMethod(userId: string, methodId: string): Promise<void> {
    const result = await PaymentMethodModel.findOneAndDelete({ _id: methodId, userId });
    if (!result) {
      throw new NotFoundError('Payment method not found');
    }
  }

  async getWallet(userId: string): Promise<WalletResponseDto> {
    let wallet = await WalletModel.findOne({ userId });
    if (!wallet) {
      wallet = await WalletModel.create({ userId, balance: 0, currency: 'INR' });
    }
    return {
      balance: wallet.balance,
      currency: wallet.currency,
      lastTopUpAt: wallet.lastTopUpAt?.toISOString(),
    };
  }

  async seedDefaultMethods(userId: string): Promise<void> {
    const count = await PaymentMethodModel.countDocuments({ userId });
    if (count > 0) return;

    await PaymentMethodModel.create({
      userId,
      type: 'upi',
      label: 'Google Pay',
      details: 'rahul@okaxis',
      isDefault: true,
    });
  }
}

export const paymentService = new PaymentService();
