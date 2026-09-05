import { Types } from 'mongoose';

import { UserModel, type IUser } from '../../models/src/user';
import type { VendorStatus } from '../../models/src/userProfileSchema';
import {
  mapVendorFilterToUserQuery,
  toVendorRecord,
  type VendorRecord,
} from './userProfileMappers';
import {
  VendorDocumentModel,
  type DocumentVerificationStatus,
  type IVendorDocument,
} from '../../models/src/vendorDocument';

export class VendorRepository {
  async create(data: {
    userId?: Types.ObjectId | string;
    vendorType: VendorRecord['vendorType'];
    status?: VendorRecord['status'];
    verificationStage?: VendorRecord['verificationStage'];
    businessName?: string;
    ownerName?: string;
    mobileNumber: string;
    email?: string;
    address?: string;
    statusHistory?: VendorRecord['statusHistory'];
    submittedAt?: Date;
    approvedAt?: Date;
  }): Promise<VendorRecord> {
    let user: IUser | null = null;

    if (data.userId) {
      user = await UserModel.findById(data.userId.toString());
      if (!user) throw new Error('User not found');
    } else {
      user = await UserModel.create({
        mobileNumber: data.mobileNumber,
        fullName: data.ownerName,
        email: data.email,
        role: 'vendor',
        isVerified: true,
        isProfileCompleted: false,
      });
    }

    user.role = 'vendor';
    user.mobileNumber = data.mobileNumber;
    user.fullName = data.ownerName ?? user.fullName;
    user.email = data.email ?? user.email;
    user.isVerified = true;
    user.vendorProfile = {
      vendorType: data.vendorType,
      status: data.status ?? 'draft',
      verificationStage: data.verificationStage ?? 'submitted',
      businessName: data.businessName,
      ownerName: data.ownerName,
      address: data.address,
      statusHistory: data.statusHistory ?? [],
      submittedAt: data.submittedAt,
      approvedAt: data.approvedAt,
    };
    await user.save();
    return toVendorRecord(user);
  }

  async findByUserId(userId: string): Promise<VendorRecord | null> {
    const user = await UserModel.findOne({
      _id: userId,
      vendorProfile: { $exists: true },
    }).exec();
    return user?.vendorProfile ? toVendorRecord(user) : null;
  }

  async findById(id: string): Promise<VendorRecord | null> {
    const user = await UserModel.findOne({ _id: id, role: 'vendor' }).exec();
    return user?.vendorProfile ? toVendorRecord(user) : null;
  }

  async findByStatus(status: VendorStatus): Promise<VendorRecord[]> {
    const users = await UserModel.find({ role: 'vendor', 'vendorProfile.status': status })
      .sort({ 'vendorProfile.submittedAt': -1 })
      .exec();
    return users.map(toVendorRecord);
  }

  async findAll(filters: {
    status?: VendorStatus;
    verificationStage?: string;
  }): Promise<VendorRecord[]> {
    const query: Record<string, unknown> = { role: 'vendor', vendorProfile: { $exists: true } };
    if (filters.status) query['vendorProfile.status'] = filters.status;
    if (filters.verificationStage) query['vendorProfile.verificationStage'] = filters.verificationStage;
    const users = await UserModel.find(query)
      .sort({ 'vendorProfile.submittedAt': -1, createdAt: -1 })
      .exec();
    return users.map(toVendorRecord);
  }

  async findAllPending(): Promise<VendorRecord[]> {
    const users = await UserModel.find({
      role: 'vendor',
      'vendorProfile.status': { $in: ['pending', 'under_review'] },
    })
      .sort({ 'vendorProfile.submittedAt': -1 })
      .exec();
    return users.map(toVendorRecord);
  }

  async updateById(id: string, data: Partial<VendorRecord>): Promise<VendorRecord | null> {
    const user = await UserModel.findById(id);
    if (!user?.vendorProfile) return null;

    if (data.mobileNumber) user.mobileNumber = data.mobileNumber;
    if (data.email !== undefined) user.email = data.email;
    if (data.ownerName) user.fullName = data.ownerName;
    if (data.fullName) user.fullName = data.fullName;

    const profile = user.vendorProfile;
    if (data.vendorType) profile.vendorType = data.vendorType;
    if (data.status) profile.status = data.status;
    if (data.verificationStage) profile.verificationStage = data.verificationStage;
    if (data.businessName !== undefined) profile.businessName = data.businessName;
    if (data.ownerName !== undefined) profile.ownerName = data.ownerName;
    if (data.address !== undefined) profile.address = data.address;
    if (data.towVehicle) profile.towVehicle = data.towVehicle;
    if (data.bankDetails) profile.bankDetails = data.bankDetails;
    if (data.driverProfile) profile.partnerDriverDetails = data.driverProfile;
    if (data.reviewNotes !== undefined) profile.reviewNotes = data.reviewNotes;
    if (data.documentReviews) profile.documentReviews = data.documentReviews;
    if (data.statusHistory) profile.statusHistory = data.statusHistory;
    if (data.submittedAt) profile.submittedAt = data.submittedAt;
    if (data.approvedAt) profile.approvedAt = data.approvedAt;

    await user.save();
    return toVendorRecord(user);
  }

  async findUsers(filter: Record<string, unknown>): Promise<IUser[]> {
    return UserModel.find(mapVendorFilterToUserQuery(filter)).exec();
  }

  async countUsers(filter: Record<string, unknown>): Promise<number> {
    return UserModel.countDocuments(mapVendorFilterToUserQuery(filter));
  }

  async upsertDocument(
    vendorId: string,
    documentType: string,
    data: {
      fileUrl: string;
      fileName?: string;
      mimeType?: string;
      verificationStatus?: DocumentVerificationStatus;
    },
  ): Promise<IVendorDocument> {
    return VendorDocumentModel.findOneAndUpdate(
      { vendorId, documentType },
      {
        $set: {
          fileUrl: data.fileUrl,
          fileName: data.fileName,
          mimeType: data.mimeType,
          verificationStatus: data.verificationStatus ?? 'pending',
          uploadedAt: new Date(),
        },
      },
      { upsert: true, new: true },
    ).exec() as Promise<IVendorDocument>;
  }

  async replaceDocuments(
    vendorId: string,
    documents: Array<{ documentType: string; fileUrl: string; fileName?: string; mimeType?: string }>,
  ) {
    for (const doc of documents) {
      await this.upsertDocument(vendorId, doc.documentType, doc);
    }
    return VendorDocumentModel.find({ vendorId }).sort({ uploadedAt: -1 }).exec();
  }

  async findDocuments(vendorId: string) {
    return VendorDocumentModel.find({ vendorId }).sort({ uploadedAt: -1 }).exec();
  }

  async findDocument(vendorId: string, documentType: string) {
    return VendorDocumentModel.findOne({ vendorId, documentType }).exec();
  }

  async updateDocumentStatus(
    vendorId: string,
    documentType: string,
    verificationStatus: DocumentVerificationStatus,
    reviewNotes?: string,
  ) {
    return VendorDocumentModel.findOneAndUpdate(
      { vendorId, documentType },
      { $set: { verificationStatus, reviewNotes } },
      { new: true },
    ).exec();
  }
}

export const vendorRepository = new VendorRepository();
