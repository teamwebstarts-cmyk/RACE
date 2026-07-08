import {
  Headphones,
  ShieldCheck,
  Star,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';

import { images } from '../assets';

export const HOME_HERO_IMAGE = images.homeHeroTruck;

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

/** Banner images keyed by service category — UI assets only, not pricing data. */
export const CATEGORY_HERO_IMAGES = {
  towing: images.homePopularTowing,
  roadside: images.homePopularRoadside,
  driver: images.homePopularDriver,
  emergency_repair: images.homePopularRepair,
  vehicle_recovery: images.homePopularRecovery,
} as const;

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
