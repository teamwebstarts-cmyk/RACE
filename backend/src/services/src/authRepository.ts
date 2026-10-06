import { OtpLogModel, type IOtpLog } from '../../models/src/otpLog';

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

  async findRecentlyVerifiedOtpLog(
    mobileNumber: string,
    otp: string,
    withinMs: number,
  ): Promise<IOtpLog | null> {
    const since = new Date(Date.now() - withinMs);
    // In MC mode mobileOtp is not stored; match either by otp OR any verified log with mcVerificationId
    return OtpLogModel.findOne({
      mobileNumber,
      mobileVerified: true,
      createdAt: { $gte: since },
      $or: [
        { mobileOtp: otp },
        { mcVerificationId: { $exists: true, $ne: null } },
      ],
    })
      .sort({ createdAt: -1 })
      .exec();
  }

}

export const authRepository = new AuthRepository();
