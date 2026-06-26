import { CatalogServiceModel, type ICatalogService } from '../models/catalog';

export class CatalogRepository {
  async findAllActive(): Promise<ICatalogService[]> {
    return CatalogServiceModel.find({ isActive: true }).sort({ category: 1, sortOrder: 1 }).exec();
  }

  async upsertMany(services: Partial<ICatalogService>[]): Promise<void> {
    const ops = services.map((service) => ({
      updateOne: {
        filter: { slug: service.slug },
        update: { $set: service },
        upsert: true,
      },
    }));

    if (ops.length > 0) {
      await CatalogServiceModel.bulkWrite(ops);
    }
  }
}

export const catalogRepository = new CatalogRepository();
