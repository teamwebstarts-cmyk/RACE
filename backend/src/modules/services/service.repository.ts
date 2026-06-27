import { ServiceModel, type IService } from './service.model';

export class ServiceRepository {
  async findAllActive(): Promise<IService[]> {
    return ServiceModel.find({ isActive: true }).sort({ category: 1, sortOrder: 1 }).exec();
  }

  async upsertMany(services: Partial<IService>[]): Promise<void> {
    const ops = services.map((service) => ({
      updateOne: {
        filter: { slug: service.slug },
        update: { $set: service },
        upsert: true,
      },
    }));

    if (ops.length > 0) {
      await ServiceModel.bulkWrite(ops);
    }
  }
}

export const serviceRepository = new ServiceRepository();
