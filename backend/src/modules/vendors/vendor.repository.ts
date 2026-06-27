import { VendorModel, type IVendor, type VendorStatus } from './vendor.model';
import {
  VendorDocumentModel,
  type DocumentVerificationStatus,
  type IVendorDocument,
} from './vendor-document.model';

export class VendorRepository {
  async create(data: Partial<IVendor>): Promise<IVendor> {
    return VendorModel.create(data);
  }

  async findByUserId(userId: string): Promise<IVendor | null> {
    return VendorModel.findOne({ userId }).exec();
  }

  async findById(id: string): Promise<IVendor | null> {
    return VendorModel.findById(id).exec();
  }

  async findByStatus(status: VendorStatus): Promise<IVendor[]> {
    return VendorModel.find({ status }).sort({ submittedAt: -1 }).exec();
  }

  async findAll(filters: { status?: VendorStatus; verificationStage?: string }): Promise<IVendor[]> {
    const query: Record<string, string> = {};
    if (filters.status) query.status = filters.status;
    if (filters.verificationStage) query.verificationStage = filters.verificationStage;
    return VendorModel.find(query).sort({ submittedAt: -1, createdAt: -1 }).exec();
  }

  async findAllPending(): Promise<IVendor[]> {
    return VendorModel.find({ status: { $in: ['pending', 'under_review'] } })
      .sort({ submittedAt: -1 })
      .exec();
  }

  async updateById(id: string, data: Partial<IVendor>): Promise<IVendor | null> {
    const vendor = await VendorModel.findById(id);
    if (!vendor) return null;
    Object.assign(vendor, data);
    return vendor.save();
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
