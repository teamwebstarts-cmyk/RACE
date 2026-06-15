export type HighlightIcon = 'clock' | 'phone' | 'live';

export interface Highlight {
  id: string;
  value: string;
  label: string;
  icon: HighlightIcon;
}

export interface Brand {
  name: string;
  productName: string;
  website: string;
  tagline: string;
  description: string;
  location: string;
  phone: string;
  phoneRaw: string;
  email: string;
  company: string;
  highlights: Highlight[];
  features: string[];
}

export interface Service {
  id: string;
  label: string;
  description?: string;
}

export type CategoryId = 'towing' | 'driver' | 'roadside' | 'future';

export interface ServiceCategory {
  id: CategoryId;
  title: string;
  icon: string;
  description?: string;
  services: Service[];
}

export interface CategoryTheme {
  background: string;
  accent: string;
  iconBackground: string;
}

export type LogoSize = 'small' | 'medium' | 'large';

export type ButtonVariant = 'primary' | 'outline';
