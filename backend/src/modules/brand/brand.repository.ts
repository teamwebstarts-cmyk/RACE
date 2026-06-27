import { BrandModel, type IBrand } from './brand.model';

export class BrandRepository {
  async findActive(): Promise<IBrand | null> {
    return BrandModel.findOne({ isActive: true }).sort({ updatedAt: -1 }).exec();
  }

  async upsertBrand(data: Partial<IBrand>): Promise<IBrand> {
    const existing = await BrandModel.findOne({ isActive: true }).exec();

    if (existing) {
      Object.assign(existing, data);
      return existing.save();
    }

    return BrandModel.create(data);
  }
}

export const brandRepository = new BrandRepository();
