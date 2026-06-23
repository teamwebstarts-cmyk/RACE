import {
  Battery,
  Circle,
  Fuel,
  Headphones,
  ShieldCheck,
  Star,
  Truck,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';

import { images } from '../assets';

export const HOME_HERO_IMAGE = images.homeHeroTruck;

export const QUICK_SERVICES: Array<{
  id: string;
  label: string;
  Icon: LucideIcon;
  categoryId: string;
  categoryTitle: string;
}> = [
  {
    id: 'towing',
    label: 'Towing',
    Icon: Truck,
    categoryId: 'towing',
    categoryTitle: 'Towing Service',
  },
  {
    id: 'battery',
    label: 'Battery Jump Start',
    Icon: Battery,
    categoryId: 'roadside',
    categoryTitle: 'Roadside Assistance',
  },
  {
    id: 'tyre',
    label: 'Flat Tyre',
    Icon: Circle,
    categoryId: 'roadside',
    categoryTitle: 'Roadside Assistance',
  },
  {
    id: 'fuel',
    label: 'Fuel Delivery',
    Icon: Fuel,
    categoryId: 'roadside',
    categoryTitle: 'Roadside Assistance',
  },
];

export const TRUST_ITEMS: Array<{
  id: string;
  Icon: LucideIcon;
  highlight: string;
  label: string;
}> = [
  { id: 'speed', Icon: Zap, highlight: '25 min', label: 'or less' },
  { id: 'trust', Icon: ShieldCheck, highlight: 'Trusted', label: 'Professionals' },
  { id: 'support', Icon: Headphones, highlight: '24/7', label: 'Support' },
];

/** Order matches provided banner assets */
export const POPULAR_SERVICES = [
  {
    id: 'towing',
    title: 'Towing Service',
    price: 399,
    image: images.homePopularTowing,
    categoryId: 'towing',
    categoryTitle: 'Towing Service',
  },
  {
    id: 'roadside',
    title: 'Roadside Assistance',
    price: 299,
    image: images.homePopularRoadside,
    categoryId: 'roadside',
    categoryTitle: 'Roadside Assistance',
  },
  {
    id: 'driver',
    title: 'Driver On Demand',
    price: 399,
    image: images.homePopularDriver,
    categoryId: 'driver',
    categoryTitle: 'Driver Service',
  },
  {
    id: 'emergency_repair',
    title: 'Emergency Repair',
    price: 499,
    image: images.homePopularRepair,
    categoryId: 'emergency_repair',
    categoryTitle: 'Emergency Repair',
  },
  {
    id: 'vehicle_recovery',
    title: 'Vehicle Recovery',
    price: 999,
    image: images.homePopularRecovery,
    categoryId: 'vehicle_recovery',
    categoryTitle: 'Vehicle Recovery',
  },
] as const;

export const HOME_STATS: Array<{
  id: string;
  value: string;
  label: string;
  Icon: LucideIcon;
}> = [
  { id: 'customers', value: '50K+', label: 'Happy Customers', Icon: Users },
  { id: 'rating', value: '4.9★', label: 'Customer Rating', Icon: Star },
  { id: 'available', value: '24/7', label: 'Always Available', Icon: Headphones },
];

export function getGreeting(name: string) {
  const hour = new Date().getHours();
  const period =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  return `${period}, ${name.split(' ')[0]} 👋`;
}
