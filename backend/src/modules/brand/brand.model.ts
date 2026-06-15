import { Schema, model, type Document } from 'mongoose';

export interface IBrandHighlight {
  id: string;
  value: string;
  label: string;
  icon: string;
}

export interface IBrand extends Document {
  appName: string;
  logo: string;
  supportPhone: string;
  primaryColor: string;
  secondaryColor: string;
  productName?: string;
  website?: string;
  tagline?: string;
  description?: string;
  location?: string;
  email?: string;
  company?: string;
  highlights?: IBrandHighlight[];
  features?: string[];
  colors?: Record<string, string>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BrandHighlightSchema = new Schema<IBrandHighlight>(
  {
    id: { type: String, required: true },
    value: { type: String, required: true },
    label: { type: String, required: true },
    icon: { type: String, required: true },
  },
  { _id: false },
);

const BrandSchema = new Schema<IBrand>(
  {
    appName: { type: String, required: true },
    logo: { type: String, required: true },
    supportPhone: { type: String, required: true },
    primaryColor: { type: String, required: true },
    secondaryColor: { type: String, required: true },
    productName: { type: String },
    website: { type: String },
    tagline: { type: String },
    description: { type: String },
    location: { type: String },
    email: { type: String },
    company: { type: String },
    highlights: { type: [BrandHighlightSchema], default: [] },
    features: { type: [String], default: [] },
    colors: { type: Schema.Types.Mixed },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const BrandModel = model<IBrand>('Brand', BrandSchema);
