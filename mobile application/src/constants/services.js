import services from '../data/services.json';

export const SERVICE_CATEGORIES = services;

export function getCategoryById(categoryId) {
  return SERVICE_CATEGORIES.find(category => category.id === categoryId);
}
