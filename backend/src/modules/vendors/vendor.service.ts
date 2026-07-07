import { AppError, ConflictError, NotFoundError } from '../../shared/utils/errors';
import { notificationService } from '../../shared/services/notification.service';
import { storageService } from '../../shared/services/storage.service';
import { userRepository } from '../users/user.repository';
import { vendorRepository } from './vendor.repository';
import type { IVendor } from './vendor.model';
import {
  REQUIRED_DOCUMENTS,
  type RegisterVendorDto,
  type ReviewDocumentDto,
  type ReviewVendorDto,
  type SaveVendorDraftDto,
  type UpdateVendorDto,
  type VendorResponseDto,
} from './vendor.validator';

async function mapVendor(vendor: IVendor): Promise<VendorResponseDto> {
  const documents = await vendorRepository.findDocuments(vendor.id);
  return {
    id: vendor.id,
    userId: vendor.userId.toString(),
    vendorType: vendor.vendorType,
    status: vendor.status,
    verificationStage: vendor.verificationStage,
    businessName: vendor.businessName,
    ownerName: vendor.ownerName,
    mobileNumber: vendor.mobileNumber,
    email: vendor.email,
    address: vendor.address,
    towVehicle: vendor.towVehicle as VendorResponseDto['towVehicle'],
    bankDetails: vendor.bankDetails as VendorResponseDto['bankDetails'],
    driverProfile: vendor.driverProfile as VendorResponseDto['driverProfile'],
    reviewNotes: vendor.reviewNotes,
    statusHistory: vendor.statusHistory.map((item) => ({
      status: item.status,
      note: item.note,
      changedAt: item.changedAt.toISOString(),
    })),
    documents: documents.map((doc) => ({
      id: doc.id,
      documentType: doc.documentType,
      fileUrl: doc.fileUrl,
      fileName: doc.fileName,
      mimeType: doc.mimeType,
      verificationStatus: doc.verificationStatus,
      reviewNotes: doc.reviewNotes,
      uploadedAt: doc.uploadedAt.toISOString(),
    })),
    submittedAt: vendor.submittedAt?.toISOString(),
    approvedAt: vendor.approvedAt?.toISOString(),
    createdAt: vendor.createdAt.toISOString(),
    updatedAt: vendor.updatedAt.toISOString(),
  };
}

function assertEditable(vendor: IVendor): void {
  if (!['draft', 'changes_requested'].includes(vendor.status)) {
    throw new ConflictError('Application cannot be edited in current status');
  }
}

function validateRequiredDocuments(vendorType: string, documentTypes: string[]): void {
  const required = REQUIRED_DOCUMENTS[vendorType] ?? [];
  const missing = required.filter((type) => !documentTypes.includes(type));
  if (missing.length > 0) {
    throw new AppError(`Missing required documents: ${missing.join(', ')}`, 400);
  }
}

export class VendorService {
  async getOrCreateDraft(userId: string, vendorType: SaveVendorDraftDto['vendorType']): Promise<IVendor> {
    const existing = await vendorRepository.findByUserId(userId);
    if (existing) return existing;

    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    return vendorRepository.create({
      userId: userId as unknown as IVendor['userId'],
      vendorType,
      status: 'draft',
      verificationStage: 'submitted',
      ownerName: user.fullName ?? '',
      mobileNumber: user.mobileNumber,
      email: user.email,
      statusHistory: [{ status: 'draft', note: 'Draft created', changedAt: new Date() }],
    });
  }

  async saveDraft(userId: string, dto: SaveVendorDraftDto): Promise<VendorResponseDto> {
    const vendor = await this.getOrCreateDraft(userId, dto.vendorType);
    assertEditable(vendor);

    const updated = await vendorRepository.updateById(vendor.id, {
      vendorType: dto.vendorType,
      businessName: dto.businessName,
      ownerName: dto.ownerName,
      mobileNumber: dto.mobileNumber,
      email: dto.email,
      address: dto.address,
      towVehicle: dto.towVehicle,
      bankDetails: dto.bankDetails,
      driverProfile: dto.driverProfile,
      status: 'draft',
    });

    if (!updated) throw new NotFoundError('Vendor not found');

    if (dto.documents?.length) {
      await vendorRepository.replaceDocuments(updated.id, dto.documents);
    }

    return mapVendor(updated);
  }

  async update(userId: string, dto: UpdateVendorDto): Promise<VendorResponseDto> {
    const vendor = await vendorRepository.findByUserId(userId);
    if (!vendor) throw new NotFoundError('No vendor application found');
    assertEditable(vendor);

    const updated = await vendorRepository.updateById(vendor.id, {
      businessName: dto.businessName,
      ownerName: dto.ownerName,
      mobileNumber: dto.mobileNumber,
      email: dto.email,
      address: dto.address,
      towVehicle: dto.towVehicle,
      bankDetails: dto.bankDetails,
      driverProfile: dto.driverProfile,
    });

    if (!updated) throw new NotFoundError('Vendor not found');

    if (dto.documents?.length) {
      await vendorRepository.replaceDocuments(updated.id, dto.documents);
    }

    return mapVendor(updated);
  }

  async uploadDocument(
    userId: string,
    documentType: string,
    file: { buffer: Buffer; mimetype: string; originalname: string },
  ): Promise<VendorResponseDto> {
    const vendor = await vendorRepository.findByUserId(userId);
    if (!vendor) throw new NotFoundError('No vendor application found');
    assertEditable(vendor);

    const upload = await storageService.uploadVendorDocument({
      buffer: file.buffer,
      mimeType: file.mimetype,
      originalName: file.originalname,
      vendorType: vendor.vendorType,
      documentType,
    });

    await vendorRepository.upsertDocument(vendor.id, documentType, {
      fileUrl: upload.fileUrl,
      fileName: upload.fileName,
      mimeType: file.mimetype,
      verificationStatus: 'pending',
    });

    const refreshed = await vendorRepository.findById(vendor.id);
    if (!refreshed) throw new NotFoundError('Vendor not found');
    return mapVendor(refreshed);
  }

  async uploadSelfie(
    userId: string,
    file: { buffer: Buffer; mimetype: string; originalname: string },
  ): Promise<VendorResponseDto> {
    return this.uploadDocument(userId, 'selfie', file);
  }

  async register(userId: string, dto: RegisterVendorDto): Promise<VendorResponseDto> {
    const existing = await vendorRepository.findByUserId(userId);
    if (existing && !['draft', 'changes_requested'].includes(existing.status)) {
      throw new ConflictError('Vendor application already submitted');
    }

    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    let vendor = existing;
    if (!vendor) {
      vendor = await vendorRepository.create({
        userId,
        vendorType: dto.vendorType,
        status: 'draft',
        verificationStage: 'submitted',
        ownerName: user.fullName ?? '',
        mobileNumber: user.mobileNumber,
        email: user.email,
        statusHistory: [],
      });
    }

    const payload = {
      vendorType: dto.vendorType,
      businessName: dto.businessName,
      ownerName: dto.ownerName,
      mobileNumber: dto.mobileNumber,
      email: dto.email,
      address: dto.address,
      towVehicle: dto.towVehicle,
      bankDetails: dto.bankDetails,
      driverProfile: dto.driverProfile,
      status: 'pending' as const,
      verificationStage: 'document_review' as const,
      submittedAt: new Date(),
      statusHistory: [
        ...vendor.statusHistory,
        { status: 'pending' as const, note: 'Application submitted', changedAt: new Date() },
        {
          status: 'document_review' as const,
          note: 'Documents queued for review',
          changedAt: new Date(),
        },
      ],
    };

    vendor = (await vendorRepository.updateById(vendor.id, payload))!;

    if (dto.documents?.length) {
      await vendorRepository.replaceDocuments(vendor.id, dto.documents);
    }

    const docs = await vendorRepository.findDocuments(vendor.id);
    validateRequiredDocuments(
      dto.vendorType,
      docs.map((d) => d.documentType),
    );

    await notificationService.notifyVendorSubmitted(userId, dto.mobileNumber, vendor.id);

    return mapVendor(vendor);
  }

  async getProfile(userId: string): Promise<VendorResponseDto> {
    return this.getStatus(userId);
  }

  async getStatus(userId: string): Promise<VendorResponseDto> {
    const vendor = await vendorRepository.findByUserId(userId);
    if (!vendor) throw new NotFoundError('No vendor application found');
    return mapVendor(vendor);
  }

  async listForAdmin(filters: {
    status?: string;
    verificationStage?: string;
  }): Promise<VendorResponseDto[]> {
    const vendors = await vendorRepository.findAll({
      status: filters.status as IVendor['status'] | undefined,
      verificationStage: filters.verificationStage,
    });
    return Promise.all(vendors.map((v) => mapVendor(v)));
  }

  async getByIdForAdmin(vendorId: string): Promise<VendorResponseDto> {
    const vendor = await vendorRepository.findById(vendorId);
    if (!vendor) throw new NotFoundError('Vendor not found');
    return mapVendor(vendor);
  }

  async approve(vendorId: string, reviewNotes?: string): Promise<VendorResponseDto> {
    return this.review(vendorId, {
      status: 'approved',
      reviewNotes,
      verificationStage: 'approved',
    });
  }

  async reject(vendorId: string, reviewNotes?: string): Promise<VendorResponseDto> {
    return this.review(vendorId, {
      status: 'rejected',
      reviewNotes,
      verificationStage: 'rejected',
    });
  }

  async requestResubmission(vendorId: string, reviewNotes?: string): Promise<VendorResponseDto> {
    return this.review(vendorId, {
      status: 'changes_requested',
      reviewNotes,
      verificationStage: 'document_review',
    });
  }

  async review(vendorId: string, dto: ReviewVendorDto): Promise<VendorResponseDto> {
    let vendor = await vendorRepository.findById(vendorId);
    if (!vendor) throw new NotFoundError('Vendor not found');

    if (dto.status === 'approved') {
      const approvedAt = new Date();
      await userRepository.updateById(vendor.userId.toString(), { role: 'vendor' });
      await notificationService.notifyVendorApproved(
        vendor.userId.toString(),
        vendor.mobileNumber,
        vendor.id,
      );
      vendor = (await vendorRepository.updateById(vendor.id, {
        status: 'approved',
        approvedAt,
        verificationStage: 'approved',
        reviewNotes: dto.reviewNotes,
        statusHistory: [
          ...vendor.statusHistory,
          {
            status: dto.verificationStage ?? dto.status,
            note: dto.reviewNotes,
            changedAt: new Date(),
          },
        ],
      }))!;
    } else if (dto.status === 'rejected') {
      await notificationService.notifyVendorRejected(
        vendor.userId.toString(),
        vendor.mobileNumber,
        vendor.id,
        dto.reviewNotes,
      );
      vendor = (await vendorRepository.updateById(vendor.id, {
        status: 'rejected',
        verificationStage: 'rejected',
        reviewNotes: dto.reviewNotes,
        statusHistory: [
          ...vendor.statusHistory,
          {
            status: dto.verificationStage ?? dto.status,
            note: dto.reviewNotes,
            changedAt: new Date(),
          },
        ],
      }))!;
    } else {
      await notificationService.notifyResubmissionRequired(
        vendor.userId.toString(),
        vendor.mobileNumber,
        vendor.id,
        dto.reviewNotes,
      );
      vendor = (await vendorRepository.updateById(vendor.id, {
        status: 'changes_requested',
        verificationStage: dto.verificationStage ?? 'document_review',
        reviewNotes: dto.reviewNotes,
        statusHistory: [
          ...vendor.statusHistory,
          {
            status: dto.verificationStage ?? dto.status,
            note: dto.reviewNotes,
            changedAt: new Date(),
          },
        ],
      }))!;
    }

    if (!vendor) throw new NotFoundError('Vendor not found');
    return mapVendor(vendor);
  }

  async reviewDocument(
    vendorId: string,
    documentType: string,
    dto: ReviewDocumentDto,
  ): Promise<VendorResponseDto> {
    const vendor = await vendorRepository.findById(vendorId);
    if (!vendor) throw new NotFoundError('Vendor not found');

    const doc = await vendorRepository.updateDocumentStatus(
      vendorId,
      documentType,
      dto.verificationStatus,
      dto.reviewNotes,
    );
    if (!doc) throw new NotFoundError('Document not found');

    if (dto.verificationStatus === 'approved') {
      await notificationService.send({
        userId: vendor.userId.toString(),
        mobileNumber: vendor.mobileNumber,
        vendorId: vendor.id,
        event: 'vendor_documents_approved',
        title: 'Document Approved',
        body: `Your ${documentType.replace(/_/g, ' ')} document has been approved.`,
      });
    } else if (
      dto.verificationStatus === 'rejected' ||
      dto.verificationStatus === 'resubmission_required'
    ) {
      await notificationService.send({
        userId: vendor.userId.toString(),
        mobileNumber: vendor.mobileNumber,
        vendorId: vendor.id,
        event: 'vendor_documents_rejected',
        title: 'Document Review',
        body: dto.reviewNotes ?? `Please re-upload your ${documentType.replace(/_/g, ' ')} document.`,
      });
    }

    return mapVendor(vendor);
  }
}

export const vendorService = new VendorService();
