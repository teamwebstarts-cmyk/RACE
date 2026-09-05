import {
  Headphones,
  LayoutGrid,
  ShieldCheck,
  Timer,
  Truck,
  User,
  Wrench,
  type LucideIcon,
} from 'lucide-react-native';

import type { ServiceCategory } from '../types/models';

export const SERVICES_TRUST_ITEMS: Array<{
  id: string;
  Icon: LucideIcon;
  highlight: string;
  label: string;
}> = [
  { id: 'arrival', Icon: Timer, highlight: '25 min', label: 'Avg. Arrival' },
  { id: 'support', Icon: Headphones, highlight: '24/7', label: 'Live Support' },
  { id: 'trust', Icon: ShieldCheck, highlight: 'Trusted', label: 'Professionals' },
];

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  towing: Truck,
  driver: User,
  roadside: Wrench,
  future: LayoutGrid,
};

export function getServiceCategoryIcon(categoryId: string): LucideIcon {
  return CATEGORY_ICONS[categoryId] ?? LayoutGrid;
}

export function mapApiCategoryToGridCard(category: ServiceCategory) {
  return {
    id: category.id,
    categoryId: category.id,
    title: category.title,
    description: category.description ?? '',
    servicesCount: category.services.length,
    Icon: getServiceCategoryIcon(category.id),
    comingSoon: category.id === 'future',
  };
}
