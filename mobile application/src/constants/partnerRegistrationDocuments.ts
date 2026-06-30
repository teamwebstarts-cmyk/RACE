import {
  Building2,
  Camera,
  Car,
  CreditCard,
  FileText,
  Fingerprint,
  IdCard,
  Shield,
  Store,
  User,
} from 'lucide-react-native';

import type { PartnerDocumentFieldConfig } from '../components/partner/PartnerDocumentUploadList';

export const VENDOR_DOCUMENTS: PartnerDocumentFieldConfig[] = [
  { id: 'aadhaar', label: 'Aadhaar Card', hint: 'Upload front side', required: true, Icon: Fingerprint },
  { id: 'pan', label: 'PAN Card', required: true, Icon: IdCard },
  { id: 'gst', label: 'GST Certificate', required: false, Icon: FileText },
  {
    id: 'business_registration',
    label: 'Business Registration Certificate',
    required: true,
    Icon: Building2,
  },
  { id: 'shop_photo', label: 'Shop / Office Photo', required: true, Icon: Store },
  {
    id: 'cancelled_cheque',
    label: 'Cancelled Cheque / Passbook',
    required: true,
    Icon: CreditCard,
  },
  { id: 'profile_photo', label: 'Profile Photo', required: true, Icon: Camera },
];

export const DRIVER_DOCUMENTS: PartnerDocumentFieldConfig[] = [
  { id: 'aadhaar', label: 'Aadhaar Card', hint: 'Upload front side', required: true, Icon: Fingerprint },
  { id: 'pan', label: 'PAN Card', required: true, Icon: IdCard },
  { id: 'driving_license', label: 'Driving License', required: true, Icon: IdCard },
  { id: 'rc_book', label: 'RC Book', required: true, Icon: FileText },
  { id: 'insurance', label: 'Insurance Certificate', required: true, Icon: Shield },
  { id: 'vehicle_photo', label: 'Vehicle Photo', required: true, Icon: Car },
  { id: 'profile_photo', label: 'Profile Photo', required: true, Icon: User },
  {
    id: 'bank_passbook',
    label: 'Bank Details / Passbook',
    required: true,
    Icon: CreditCard,
  },
];

export function getRequiredDocumentIds(documents: PartnerDocumentFieldConfig[]): string[] {
  return documents.filter((doc) => doc.required).map((doc) => doc.id);
}
