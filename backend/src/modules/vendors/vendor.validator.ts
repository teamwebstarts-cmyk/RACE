import { z } from 'zod';

export const vendorTypeSchema = z.enum([
  'towing_company',
  'tow_truck_driver',
  'full_time_driver',
  'part_time_driver',
  'mechanic',
]);

export const registerVendorSchema = z.object({
  vendorType: vendorTypeSchema,
  businessName: z.string().min(2).max(150).optional(),
  ownerName: z.string().min(2).max(100),
  mobileNumber: z.string().min(10).max(15),
  email: z.string().email().optional(),
  address: z.string().min(5).max(300).optional(),
  towVehicle: z
    .object({
      registrationNumber: z.string().min(4).max(20),
      vehicleType: z.string().min(2).max(50),
      capacity: z.string().max(50).optional(),
      photos: z.array(z.string().url()).optional(),
    })
    .optional(),
  bankDetails: z
    .object({
      accountHolderName: z.string().min(2).max(100),
      accountNumber: z.string().min(6).max(30),
      ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/i, 'Invalid IFSC'),
    })
    .optional(),
  documents: z
    .array(
      z.object({
        documentType: z.enum([
          'aadhaar',
          'pan',
          'gst',
          'msme',
          'cancelled_cheque',
          'commercial_licence',
          'police_verification',
          'vehicle_insurance',
          'fitness_certificate',
          'puc',
          'selfie',
          'vehicle_photo',
          'other',
        ]),
        fileUrl: z.string().url(),
        fileName: z.string().max(200).optional(),
      }),
    )
    .optional(),
  acceptTerms: z.literal(true),
});

export const reviewVendorSchema = z.object({
  status: z.enum(['approved', 'rejected', 'changes_requested']),
  reviewNotes: z.string().max(500).optional(),
});

export type RegisterVendorDto = z.infer<typeof registerVendorSchema>;
export type ReviewVendorDto = z.infer<typeof reviewVendorSchema>;

export interface VendorResponseDto {
  id: string;
  userId: string;
  vendorType: string;
  status: string;
  businessName?: string;
  ownerName?: string;
  mobileNumber: string;
  email?: string;
  address?: string;
  towVehicle?: {
    registrationNumber: string;
    vehicleType: string;
    capacity?: string;
    photos?: string[];
  };
  bankDetails?: {
    accountHolderName: string;
    accountNumber: string;
    ifsc: string;
  };
  reviewNotes?: string;
  statusHistory: Array<{
    status: string;
    note?: string;
    changedAt: string;
  }>;
  documents: Array<{
    documentType: string;
    fileUrl: string;
    fileName?: string;
    uploadedAt: string;
  }>;
  submittedAt?: string;
  approvedAt?: string;
}
