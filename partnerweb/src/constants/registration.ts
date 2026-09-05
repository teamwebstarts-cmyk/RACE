export const DRIVER_REGISTRATION_STEPS = [
  'Personal Info',
  'Vehicle Details',
  'Documents',
  'Review',
] as const;

export const VENDOR_REGISTRATION_STEPS = [
  'Business',
  'Address',
  'Documents',
  'Review',
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
  'Odisha',
  'Maharashtra',
  'Delhi',
  'Karnataka',
  'Gujarat',
  'Tamil Nadu',
  'Rajasthan',
  'Other',
];

export const DRIVER_DOCUMENTS = [
  { id: 'aadhaar', label: 'Aadhaar Card', required: true },
  { id: 'pan', label: 'PAN Card', required: true },
  { id: 'driving_license', label: 'Driving License', required: true },
  { id: 'rc_book', label: 'RC Book', required: true },
  { id: 'insurance', label: 'Insurance Certificate', required: true },
  { id: 'vehicle_photo', label: 'Vehicle Photo', required: true },
  { id: 'profile_photo', label: 'Profile Photo', required: true },
  { id: 'bank_passbook', label: 'Bank Details / Passbook', required: true },
] as const;

export const VENDOR_DOCUMENTS = [
  { id: 'aadhaar', label: 'Aadhaar Card', required: true },
  { id: 'pan', label: 'PAN Card', required: true },
  { id: 'gst', label: 'GST Certificate', required: false },
  { id: 'business_registration', label: 'Business Registration Certificate', required: true },
  { id: 'shop_photo', label: 'Shop / Office Photo', required: true },
  { id: 'cancelled_cheque', label: 'Cancelled Cheque / Passbook', required: true },
  { id: 'profile_photo', label: 'Profile Photo', required: true },
] as const;

export const VENDOR_DOC_TYPE_MAP: Record<string, string> = {
  aadhaar: 'aadhaar',
  pan: 'pan',
  gst: 'gst',
  business_registration: 'shop_license',
  shop_photo: 'vehicle_photo',
  cancelled_cheque: 'cancelled_cheque',
  profile_photo: 'selfie',
};
