import { ConflictError, NotFoundError } from '../../shared/utils/errors';
import { userRepository } from '../users/user.repository';
import { vendorRepository } from './vendor.repository';
import type { IVendor } from './vendor.model';
import type { RegisterVendorDto, ReviewVendorDto, VendorResponseDto } from './vendor.validator';

async function mapVendor(vendor: IVendor): Promise<VendorResponseDto> {
  const documents = await vendorRepository.findDocuments(vendor.id);
  return {
    id: vendor.id,
    userId: vendor.userId.toString(),
    vendorType: vendor.vendorType,
    status: vendor.status,
    businessName: vendor.businessName,
    ownerName: vendor.ownerName,
    mobileNumber: vendor.mobileNumber,
    email: vendor.email,
    address: vendor.address,
    towVehicle: vendor.towVehicle,
    bankDetails: vendor.bankDetails,
    reviewNotes: vendor.reviewNotes,
    statusHistory: vendor.statusHistory.map((item) => ({
      status: item.status,
      note: item.note,
      changedAt: item.changedAt.toISOString(),
    })),
    documents: documents.map((doc) => ({
      documentType: doc.documentType,
      fileUrl: doc.fileUrl,
      fileName: doc.fileName,
      uploadedAt: doc.uploadedAt.toISOString(),
    })),
    submittedAt: vendor.submittedAt?.toISOString(),
    approvedAt: vendor.approvedAt?.toISOString(),
  };
}

export class VendorService {
  async register(userId: string, dto: RegisterVendorDto): Promise<VendorResponseDto> {
    const existing = await vendorRepository.findByUserId(userId);
    if (existing && existing.status !== 'draft' && existing.status !== 'changes_requested') {
      throw new ConflictError('Vendor application already submitted');
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const payload = {
      userId: userId as unknown as IVendor['userId'],
      vendorType: dto.vendorType,
      status: 'pending' as const,
      businessName: dto.businessName,
      ownerName: dto.ownerName,
      mobileNumber: dto.mobileNumber,
      email: dto.email,
      address: dto.address,
      towVehicle: dto.towVehicle,
      bankDetails: dto.bankDetails,
      submittedAt: new Date(),
      statusHistory: [
        {
          status: 'pending' as const,
          note: 'Application submitted',
          changedAt: new Date(),
        },
      ],
    };

    const vendor = existing
      ? await vendorRepository.updateById(existing.id, payload)
      : await vendorRepository.create(payload);

    if (!vendor) {
      throw new NotFoundError('Vendor not found');
    }

    if (dto.documents?.length) {
      await vendorRepository.replaceDocuments(vendor.id, dto.documents);
    }

    await userRepository.updateById(userId, { role: 'vendor' });

    return mapVendor(vendor);
  }

  async getStatus(userId: string): Promise<VendorResponseDto> {
    const vendor = await vendorRepository.findByUserId(userId);
    if (!vendor) {
      throw new NotFoundError('No vendor application found');
    }
    return mapVendor(vendor);
  }

  async listPending(): Promise<VendorResponseDto[]> {
    const vendors = await vendorRepository.findAllPending();
    return Promise.all(vendors.map((vendor) => mapVendor(vendor)));
  }

  async review(vendorId: string, dto: ReviewVendorDto): Promise<VendorResponseDto> {
    const vendor = await vendorRepository.findById(vendorId);
    if (!vendor) {
      throw new NotFoundError('Vendor not found');
    }

    vendor.status = dto.status;
    vendor.reviewNotes = dto.reviewNotes;
    vendor.statusHistory.push({
      status: dto.status,
      note: dto.reviewNotes,
      changedAt: new Date(),
    });
    if (dto.status === 'approved') {
      vendor.approvedAt = new Date();
    }
    await vendor.save();

    return mapVendor(vendor);
  }
}

export const vendorService = new VendorService();
