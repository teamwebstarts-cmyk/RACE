import { Headphones, LayoutGrid, ShieldCheck, Timer, Truck, User, Wrench } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

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

export const SERVICE_GRID_CARDS: Array<{
  id: string;
  categoryId: string;
  title: string;
  description: string;
  servicesCount: number;
  Icon: LucideIcon;
  comingSoon?: boolean;
}> = [
  {
    id: 'towing',
    categoryId: 'towing',
    title: 'Towing Service',
    description: 'Professional towing with under-lift and flatbed options',
    servicesCount: 3,
    Icon: Truck,
  },
  {
    id: 'driver',
    categoryId: 'driver',
    title: 'Driver Service',
    description: 'Hire verified drivers for daily or long trips',
    servicesCount: 4,
    Icon: User,
  },
  {
    id: 'roadside',
    categoryId: 'roadside',
    title: 'Roadside Assistance',
    description: 'Battery, tyre, fuel and minor repair assistance',
    servicesCount: 4,
    Icon: Wrench,
  },
  {
    id: 'future',
    categoryId: 'future',
    title: 'More Services',
    description: 'Additional services launching soon',
    servicesCount: 8,
    Icon: LayoutGrid,
    comingSoon: true,
  },
];
