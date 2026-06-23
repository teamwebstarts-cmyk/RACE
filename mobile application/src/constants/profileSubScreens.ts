import type { LucideIcon } from 'lucide-react-native';
import {
  Bell,
  CreditCard,
  FileText,
  Globe,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Shield,
  Smartphone,
  Trash2,
} from 'lucide-react-native';

export const PROFILE_PERSONAL = {
  dob: '12 May 1998',
  gender: 'Male',
  emergency: '+91 98765 43210',
  address: '123, MG Road, Bhubaneswar',
};

export const PROFILE_MENU_ROUTES = {
  personal: 'PersonalInformation',
  vehicles: 'MyVehicles',
  locations: 'SavedLocations',
  payments: 'PaymentMethods',
  notifications: 'Notifications',
  support: 'HelpSupport',
  settings: 'Settings',
} as const;

export const HELP_FAQ_ITEMS = [
  'How do I book a towing service?',
  'What areas do you cover?',
  'How is the price calculated?',
  'Can I cancel my booking?',
  'How do I track my driver?',
] as const;

export type SettingsToggleId = 'push' | 'email' | 'sms' | 'emergency';

export type SettingsRow =
  | {
      id: string;
      title: string;
      subtitle?: string;
      Icon: LucideIcon;
      kind: 'nav';
      value?: string;
      danger?: boolean;
      muted?: boolean;
    }
  | {
      id: SettingsToggleId;
      title: string;
      subtitle?: string;
      Icon: LucideIcon;
      kind: 'toggle';
      defaultOn: boolean;
      locked?: boolean;
    };

export const SETTINGS_SECTIONS: Array<{
  title: string;
  items: SettingsRow[];
}> = [
  {
    title: 'ACCOUNT SETTINGS',
    items: [
      { id: 'password', title: 'Change Password', subtitle: 'Update your login password', Icon: Lock, kind: 'nav' },
      { id: 'pin', title: 'Change PIN', subtitle: 'Update your 4-digit PIN', Icon: KeyRound, kind: 'nav' },
      {
        id: 'mobile',
        title: 'Change Mobile Number',
        subtitle: 'Update registered phone number',
        Icon: Smartphone,
        kind: 'nav',
      },
      { id: 'language', title: 'Language', Icon: Globe, kind: 'nav', value: 'English' },
    ],
  },
  {
    title: 'NOTIFICATION SETTINGS',
    items: [
      {
        id: 'push',
        title: 'Push Notifications',
        subtitle: 'Booking updates & offers',
        Icon: Bell,
        kind: 'toggle',
        defaultOn: true,
      },
      {
        id: 'email',
        title: 'Email Notifications',
        subtitle: 'Receipts & newsletters',
        Icon: Mail,
        kind: 'toggle',
        defaultOn: false,
      },
      {
        id: 'sms',
        title: 'SMS Alerts',
        subtitle: 'OTP & booking alerts',
        Icon: MessageCircle,
        kind: 'toggle',
        defaultOn: true,
      },
      {
        id: 'emergency',
        title: 'Emergency Alerts',
        subtitle: 'SOS & critical updates',
        Icon: Shield,
        kind: 'toggle',
        defaultOn: true,
        locked: true,
      },
    ],
  },
  {
    title: 'PRIVACY SETTINGS',
    items: [
      {
        id: 'location',
        title: 'Location Access',
        subtitle: 'For pickup & tracking',
        Icon: MapPin,
        kind: 'nav',
        value: 'Always',
      },
      {
        id: 'profileVisibility',
        title: 'Profile Visibility',
        subtitle: 'Who can see your profile',
        Icon: Shield,
        kind: 'nav',
        value: 'Public',
      },
      {
        id: 'delete',
        title: 'Delete Account',
        subtitle: 'Permanently remove your account',
        Icon: Trash2,
        kind: 'nav',
        danger: true,
      },
    ],
  },
  {
    title: 'APP INFO',
    items: [
      { id: 'version', title: 'Version', Icon: FileText, kind: 'nav', value: '1.0.0', muted: true },
      { id: 'terms', title: 'Terms & Conditions', Icon: FileText, kind: 'nav', muted: true },
      { id: 'privacy', title: 'Privacy Policy', Icon: Shield, kind: 'nav', muted: true },
      { id: 'licences', title: 'Licences', Icon: CreditCard, kind: 'nav', muted: true },
    ],
  },
];
