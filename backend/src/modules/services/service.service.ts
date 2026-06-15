import { serviceRepository } from './service.repository';
import type { IService } from './service.model';

export interface MobileServiceItem {
  id: string;
  label: string;
  description?: string;
}

export interface MobileServiceCategory {
  id: string;
  title: string;
  icon: string;
  description?: string;
  services: MobileServiceItem[];
}

export class ServiceCatalogService {
  async getGroupedServices(): Promise<MobileServiceCategory[]> {
    const services = await serviceRepository.findAllActive();
    return this.groupServices(services);
  }

  groupServices(services: IService[]): MobileServiceCategory[] {
    const categoryMap = new Map<string, MobileServiceCategory>();

    for (const service of services) {
      if (!categoryMap.has(service.category)) {
        categoryMap.set(service.category, {
          id: service.category,
          title: service.categoryTitle,
          icon: service.categoryIcon,
          description: service.categoryDescription,
          services: [],
        });
      }

      categoryMap.get(service.category)!.services.push({
        id: service.slug,
        label: service.title,
        description: service.description,
      });
    }

    return Array.from(categoryMap.values());
  }
}

export const serviceCatalogService = new ServiceCatalogService();
