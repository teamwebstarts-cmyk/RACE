import type { VendorDocumentType, VendorTypeConfig, WizardStepConfig } from '../types/vendor';

const DOC = (
  type: VendorDocumentType,
  label: string,
  required = true,
): { type: VendorDocumentType; label: string; required: boolean } => ({
  type,
  label,
  required,
});

const companyDocs = [
  DOC('aadhaar', 'Aadhaar Card'),
  DOC('pan', 'PAN Card'),
  DOC('gst', 'GST Registration', false),
  DOC('shop_license', 'Shop & Establishment Certificate'),
  DOC('msme', 'MSME / Udyam Registration'),
  DOC('cancelled_cheque', 'Cancelled Cheque'),
];

const towDriverDocs = [
  DOC('aadhaar', 'Aadhaar Card'),
  DOC('pan', 'PAN Card'),
  DOC('driving_license', 'Commercial Driving License'),
  DOC('vehicle_photo', 'Driver Photo'),
  DOC('police_verification', 'Police Verification Certificate'),
  DOC('medical_certificate', 'Medical Certificate'),
];

const towVehicleDocs = [
  DOC('commercial_permit', 'Commercial Permit'),
  DOC('vehicle_insurance', 'Insurance'),
  DOC('fitness_certificate', 'Fitness Certificate'),
  DOC('puc', 'PUC Certificate'),
];

const driverDocs = [
  DOC('aadhaar', 'Aadhaar Card'),
  DOC('pan', 'PAN Card'),
  DOC('driving_license', 'Driving License'),
  DOC('police_verification', 'Police Verification'),
  DOC('medical_certificate', 'Medical Certificate'),
];

function steps(...items: WizardStepConfig[]): WizardStepConfig[] {
  return items;
}

export const VENDOR_TYPE_CONFIGS: VendorTypeConfig[] = [
  {
    type: 'towing_company',
    title: 'Towing Company',
    subtitle: 'Fleet operators and towing businesses',
    emoji: '🚛',
    steps: steps(
      {
        id: 'business_info',
        kind: 'business_info',
        title: 'Business Information',
        subtitle: 'Tell us about your towing business',
      },
      {
        id: 'company_documents',
        kind: 'documents',
        title: 'Business Documents',
        subtitle: 'Upload KYC and business registration documents',
        documents: companyDocs,
      },
      {
        id: 'bank_details',
        kind: 'bank_details',
        title: 'Bank Details',
        subtitle: 'Payout account for settlements',
      },
      {
        id: 'selfie',
        kind: 'selfie',
        title: 'Verification',
        subtitle: 'Selfie capture and digital consent',
      },
      { id: 'review', kind: 'review', title: 'Review & Submit' },
    ),
  },
  {
    type: 'tow_truck_driver',
    title: 'Tow Truck Driver',
    subtitle: 'Independent tow truck operators',
    emoji: '🚚',
    steps: steps(
      {
        id: 'personal_info',
        kind: 'personal_info',
        title: 'Personal Information',
        subtitle: 'Your contact and emergency details',
      },
      {
        id: 'driver_documents',
        kind: 'documents',
        title: 'Upload Documents',
        subtitle: 'Identity and compliance documents',
        documents: towDriverDocs,
      },
      {
        id: 'vehicle_info',
        kind: 'vehicle_info',
        title: 'Tow Vehicle Information',
        subtitle: 'Vehicle details and permits',
        documents: towVehicleDocs,
      },
      {
        id: 'bank_details',
        kind: 'bank_details',
        title: 'Bank Details',
      },
      { id: 'review', kind: 'review', title: 'Submit Application' },
    ),
  },
  {
    type: 'full_time_driver',
    title: 'Full Time Driver',
    subtitle: 'On-demand professional drivers',
    emoji: '🚗',
    steps: steps(
      {
        id: 'personal_info',
        kind: 'personal_info',
        title: 'Personal Details',
      },
      {
        id: 'documents',
        kind: 'documents',
        title: 'Documents',
        documents: driverDocs,
      },
      {
        id: 'experience',
        kind: 'experience',
        title: 'Experience',
        subtitle: 'Driving experience and references',
      },
      {
        id: 'bank_details',
        kind: 'bank_details',
        title: 'Bank Details',
      },
      { id: 'review', kind: 'review', title: 'Submit Application' },
    ),
  },
  {
    type: 'part_time_driver',
    title: 'Part Time Driver',
    subtitle: 'Flexible driving partners',
    emoji: '🛻',
    steps: steps(
      {
        id: 'personal_info',
        kind: 'personal_info',
        title: 'Personal Details',
      },
      {
        id: 'documents',
        kind: 'documents',
        title: 'Documents',
        documents: [
          DOC('aadhaar', 'Aadhaar Card'),
          DOC('pan', 'PAN Card'),
          DOC('driving_license', 'Driving License'),
        ],
      },
      {
        id: 'availability',
        kind: 'availability',
        title: 'Availability',
        subtitle: 'When can you drive with RACE?',
      },
      {
        id: 'experience',
        kind: 'experience',
        title: 'Experience',
      },
      {
        id: 'bank_details',
        kind: 'bank_details',
        title: 'Bank Details',
      },
      { id: 'review', kind: 'review', title: 'Submit Application' },
    ),
  },
];

export function getVendorConfig(type: string): VendorTypeConfig | undefined {
  return VENDOR_TYPE_CONFIGS.find((c) => c.type === type);
}
