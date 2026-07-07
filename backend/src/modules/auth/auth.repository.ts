import { OtpLogModel, type IOtpLog } from '../../models/otp-log.model';

export class AuthRepository {
  async countRecentOtpSends(mobileNumber: string, since: Date): Promise<number> {
    return OtpLogModel.countDocuments({
      mobileNumber,
      createdAt: { $gte: since },
    }).exec();
  }

  async invalidatePendingOtps(mobileNumber: string): Promise<void> {
    const now = new Date();
    await OtpLogModel.updateMany(
      {
        mobileNumber,
        mobileVerified: false,
      },
      {
        $set: {
          mobileVerified: true,
          mobileOtpExpiry: now,
        },
      },
    ).exec();
  }

  async createOtpLog(data: Partial<IOtpLog>): Promise<IOtpLog> {
    return OtpLogModel.create(data);
  }

  async findLatestValidOtpLog(mobileNumber: string): Promise<IOtpLog | null> {
    const now = new Date();
    return OtpLogModel.findOne({
      mobileNumber,
      mobileVerified: false,
      mobileOtpExpiry: { $gt: now },
    })
      .sort({ createdAt: -1 })
      .exec();
  }
}

export const authRepository = new AuthRepository();
