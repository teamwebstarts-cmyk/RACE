import {
  Bell,
  Car,
  CreditCard,
  FileText,
  Headphones,
  MapPin,
  Settings,
  Siren,
  Star,
  Ticket,
  User as UserIcon,
  Wallet,
  type LucideIcon,
} from 'lucide-react-native';

import { USER } from './demo';
import type { User } from '../types/models';

export function getProfileQuickStats(user: User = USER) {
  return [
    { id: 'wallet', label: 'Wallet', value: `₹${user.wallet.toLocaleString('en-IN')}`, Icon: Wallet },
    { id: 'coupons', label: 'Coupons', value: `${user.coupons} Available`, Icon: Ticket },
    { id: 'rewards', label: 'Rewards', value: `${user.rewards} Points`, Icon: Star },
    { id: 'invoices', label: 'Invoices', value: `${user.invoices} Total`, Icon: FileText },
  ] as const;
}

export const PROFILE_QUICK_STATS = getProfileQuickStats();

export const PROFILE_MENU_ITEMS: Array<{
  id: string;
  title: string;
  subtitle: string;
  Icon: LucideIcon;
}> = [
  {
    id: 'personal',
    title: 'Personal Information',
    subtitle: 'Update your details',
    Icon: UserIcon,
  },
  {
    id: 'vehicles',
    title: 'My Vehicles',
    subtitle: 'Manage your vehicles',
    Icon: Car,
  },
  {
    id: 'sos',
    title: 'SOS Details',
    subtitle: 'Emergency contacts & vehicle info',
    Icon: Siren,
  },
  {
    id: 'locations',
    title: 'Saved Locations',
    subtitle: 'Home, Work and other places',
    Icon: MapPin,
  },
  {
    id: 'payments',
    title: 'Payment Methods',
    subtitle: 'Cards, UPI and Wallets',
    Icon: CreditCard,
  },
  {
    id: 'notifications',
    title: 'Notifications',
    subtitle: 'Manage your preferences',
    Icon: Bell,
  },
  {
    id: 'support',
    title: 'Help & Support',
    subtitle: 'FAQs, Chat and more',
    Icon: Headphones,
  },
  {
    id: 'settings',
    title: 'Settings',
    subtitle: 'App settings and privacy',
    Icon: Settings,
  },
];
