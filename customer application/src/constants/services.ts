import services from '../data/services.json';
import type { ServiceCategory } from '../types/models';

export const SERVICE_CATEGORIES = services as ServiceCategory[];

export function getCategoryById(
  categoryId: string,
): ServiceCategory | undefined {
  return SERVICE_CATEGORIES.find(category => category.id === categoryId);
}
