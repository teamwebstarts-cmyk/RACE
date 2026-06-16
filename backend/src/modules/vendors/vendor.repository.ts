import { VendorModel, type IVendor } from './vendor.model';
import { VendorDocumentModel } from './vendor-document.model';

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

  async findAllPending(): Promise<IVendor[]> {
    return VendorModel.find({ status: 'pending' }).sort({ submittedAt: -1 }).exec();
  }

  async updateById(id: string, data: Partial<IVendor>): Promise<IVendor | null> {
    const vendor = await VendorModel.findById(id);
    if (!vendor) return null;
    Object.assign(vendor, data);
    return vendor.save();
  }

  async replaceDocuments(
    vendorId: string,
    documents: Array<{ documentType: string; fileUrl: string; fileName?: string }>,
  ) {
    await VendorDocumentModel.deleteMany({ vendorId }).exec();
    if (!documents.length) return [];
    return VendorDocumentModel.insertMany(
      documents.map((doc) => ({ vendorId, ...doc })),
    );
  }

  async findDocuments(vendorId: string) {
    return VendorDocumentModel.find({ vendorId }).sort({ uploadedAt: -1 }).exec();
  }
}

export const vendorRepository = new VendorRepository();
