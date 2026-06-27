import { OtpLogModel, type IOtpLog } from '../../shared/models/otp-log.model';

export class AuthRepository {
  async createOtpLog(data: Partial<IOtpLog>): Promise<IOtpLog> {
    return OtpLogModel.create(data);
  }

  async findLatestPendingOtp(mobileNumber: string): Promise<IOtpLog | null> {
    return OtpLogModel.findOne({ mobileNumber, status: 'pending' })
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateOtpLog(id: string, data: Partial<IOtpLog>): Promise<IOtpLog | null> {
    return OtpLogModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }
}

export const authRepository = new AuthRepository();
