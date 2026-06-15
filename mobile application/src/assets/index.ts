import type { CategoryId } from '../types/models';

export const images = {
  logo: require('./images/logo.png'),
};

export const categoryIcons: Partial<Record<CategoryId, number>> = {
  towing: require('./images/icons/towing.png'),
  driver: require('./images/icons/truck.png'),
  roadside: require('./images/icons/roadside.png'),
  future: require('./images/icons/future.png'),
};
