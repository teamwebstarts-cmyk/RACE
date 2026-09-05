export type VendorType =
  | 'towing_company'
  | 'tow_truck_driver'
  | 'full_time_driver'
  | 'part_time_driver'
  | 'mechanic';

export type VendorStatus =
  | 'draft'
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'changes_requested';

export type VerificationStage =
  | 'submitted'
  | 'document_review'
  | 'background_check'
  | 'selfie_match'
  | 'approved'
  | 'rejected';

export type VendorDocumentType =
  | 'aadhaar'
  | 'pan'
  | 'gst'
  | 'shop_license'
  | 'msme'
  | 'cancelled_cheque'
  | 'commercial_licence'
  | 'driving_license'
  | 'police_verification'
  | 'medical_certificate'
  | 'vehicle_insurance'
  | 'fitness_certificate'
  | 'puc'
  | 'commercial_permit'
  | 'selfie'
  | 'vehicle_photo'
  | 'other';

export type DocumentVerificationStatus =
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'resubmission_required';

export interface UploadedDocument {
  documentType: VendorDocumentType;
  fileUrl: string;
  fileName?: string;
  mimeType?: string;
  verificationStatus?: DocumentVerificationStatus;
  localUri?: string;
}

export interface VendorBankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifsc: string;
  bankName?: string;
}

export interface VendorTowVehicle {
  registrationNumber: string;
  vehicleType: string;
  capacity?: string;
  photos?: string[];
}

export interface VendorDriverProfile {
  dateOfBirth?: string;
  emergencyContact?: {
    name: string;
    mobileNumber: string;
    relationship?: string;
  };
  yearsOfExperience?: number;
  vehicleCategories?: string[];
  languages?: string[];
  previousEmployer?: string;
  referenceContact?: {
    name: string;
    mobileNumber: string;
  };
  availability?: {
    hourly?: boolean;
    daily?: boolean;
    nightShift?: boolean;
    weekend?: boolean;
  };
}

export interface VendorDraft {
  vendorType: VendorType;
  businessName?: string;
  ownerName: string;
  mobileNumber: string;
  email?: string;
  address?: string;
  towVehicle?: VendorTowVehicle;
  bankDetails?: VendorBankDetails;
  driverProfile?: VendorDriverProfile;
  documents: UploadedDocument[];
  acceptTerms: boolean;
}

export interface VendorRegistrationRequest {
  vendorType: VendorType;
  businessName?: string;
  ownerName: string;
  mobileNumber: string;
  email?: string;
  address?: string;
  towVehicle?: VendorTowVehicle;
  bankDetails?: VendorBankDetails;
  driverProfile?: VendorDriverProfile;
  documents?: Array<{
    documentType: string;
    fileUrl: string;
    fileName?: string;
  }>;
  acceptTerms: true;
}

export interface VendorProfileResponse {
  id: string;
  userId: string;
  vendorType: VendorType;
  status: VendorStatus;
  verificationStage: VerificationStage;
  businessName?: string;
  ownerName?: string;
  mobileNumber: string;
  email?: string;
  address?: string;
  towVehicle?: VendorTowVehicle;
  bankDetails?: VendorBankDetails;
  driverProfile?: VendorDriverProfile;
  reviewNotes?: string;
  statusHistory: Array<{ status: string; note?: string; changedAt: string }>;
  documents: Array<{
    id: string;
    documentType: VendorDocumentType;
    fileUrl: string;
    fileName?: string;
    mimeType?: string;
    verificationStatus: DocumentVerificationStatus;
    reviewNotes?: string;
    uploadedAt: string;
  }>;
  submittedAt?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type WizardStepKind =
  | 'business_info'
  | 'personal_info'
  | 'documents'
  | 'vehicle_info'
  | 'bank_details'
  | 'experience'
  | 'availability'
  | 'selfie'
  | 'review';

export interface WizardDocumentField {
  type: VendorDocumentType;
  label: string;
  required: boolean;
}

export interface WizardStepConfig {
  id: string;
  kind: WizardStepKind;
  title: string;
  subtitle?: string;
  documents?: WizardDocumentField[];
}

export interface VendorTypeConfig {
  type: VendorType;
  title: string;
  subtitle: string;
  emoji: string;
  steps: WizardStepConfig[];
}
