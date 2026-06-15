import { useQuery } from '@tanstack/react-query';

import fallbackBrand from '../../data/brand.json';
import fallbackServices from '../../data/services.json';
import type { Brand, ServiceCategory } from '../../types/models';
import { fetchBrandConfig, fetchServiceCatalog } from './catalogApi';

const FALLBACK_CATEGORIES = fallbackServices as ServiceCategory[];
const FALLBACK_BRAND = fallbackBrand as Brand;

export function useServicesQuery() {
  return useQuery({
    queryKey: ['catalog', 'services'],
    queryFn: async () => {
      try {
        return await fetchServiceCatalog();
      } catch {
        return FALLBACK_CATEGORIES;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useBrandQuery() {
  return useQuery({
    queryKey: ['catalog', 'brand'],
    queryFn: async () => {
      try {
        return await fetchBrandConfig();
      } catch {
        return FALLBACK_BRAND;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategoryById(categoryId: string) {
  const { data: categories = FALLBACK_CATEGORIES, ...rest } = useServicesQuery();
  return {
    ...rest,
    category: categories.find((item) => item.id === categoryId),
    categories,
  };
}
