import type { LucideIcon } from 'lucide-react-native';

export interface PartnerRegistrationDocumentField {
  id: string;
  label: string;
  hint?: string;
  required: boolean;
  Icon: LucideIcon;
}

export const DRIVER_REGISTRATION_STEPS = [
  'Personal Info',
  'Vehicle Details',
  'Documents',
  'Review',
] as const;

export const VENDOR_REGISTRATION_STEPS = [
  'Registration',
  'Documents',
  'Review',
  'Submit',
] as const;

export const VEHICLE_TYPE_OPTIONS = [
  'Flatbed Tow Truck',
  'Wheel Lift Tow Truck',
  'Recovery Vehicle',
  'Roadside Assistance Van',
  'Other',
];

export const INSURANCE_PROVIDER_OPTIONS = [
  'ICICI Lombard',
  'HDFC ERGO',
  'Bajaj Allianz',
  'New India Assurance',
  'Other',
];

export const BUSINESS_TYPE_OPTIONS = [
  'Towing Company',
  'Roadside Assistance',
  'Vehicle Recovery',
  'Fleet Operator',
  'Other',
];

export const INDIAN_STATE_OPTIONS = [
  'Maharashtra',
  'Delhi',
  'Karnataka',
  'Gujarat',
  'Tamil Nadu',
  'Rajasthan',
  'Other',
];
