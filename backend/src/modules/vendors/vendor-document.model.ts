import { Schema, model, type Document, Types } from 'mongoose';

export type VendorDocumentType =
  | 'aadhaar'
  | 'pan'
  | 'gst'
  | 'msme'
  | 'cancelled_cheque'
  | 'commercial_licence'
  | 'police_verification'
  | 'vehicle_insurance'
  | 'fitness_certificate'
  | 'puc'
  | 'selfie'
  | 'vehicle_photo'
  | 'other';

export interface IVendorDocument extends Document {
  vendorId: Types.ObjectId;
  documentType: VendorDocumentType;
  fileUrl: string;
  fileName?: string;
  uploadedAt: Date;
}

const VendorDocumentSchema = new Schema<IVendorDocument>(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    documentType: {
      type: String,
      enum: [
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
      ],
      required: true,
    },
    fileUrl: { type: String, required: true },
    fileName: { type: String },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

VendorDocumentSchema.index({ vendorId: 1, documentType: 1 });

export const VendorDocumentModel = model<IVendorDocument>(
  'VendorDocument',
  VendorDocumentSchema,
);
