import { serviceRepository } from './serviceRepository';
import { SERVICE_BASE_PRICES } from './bookingConstants';
import type { IService } from '../../models/src/service';

export interface MobileServiceItem {
  id: string;
  label: string;
  description?: string;
  fromPrice?: number;
  currency?: string;
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

  async getUpcomingServices() {
    const services = await serviceRepository.findAllActive();
    return services
      .filter((s) => s.category === 'future')
      .map((s) => ({
        id: s.slug,
        title: s.title,
        description: s.description,
        icon: s.icon ?? s.categoryIcon,
        isComingSoon: true,
      }));
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
        fromPrice: SERVICE_BASE_PRICES[service.slug],
        currency: 'INR',
      });
    }

    return Array.from(categoryMap.values());
  }
}

export const serviceCatalogService = new ServiceCatalogService();
