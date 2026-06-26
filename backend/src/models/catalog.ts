import { Schema, model, type Document } from 'mongoose';

export type ServiceCategory = 'towing' | 'driver' | 'roadside' | 'future';

export interface ICatalogService extends Document {
  slug: string;
  category: ServiceCategory;
  categoryTitle: string;
  categoryIcon: string;
  categoryDescription?: string;
  title: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const CatalogServiceSchema = new Schema<ICatalogService>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    category: {
      type: String,
      enum: ['towing', 'driver', 'roadside', 'future'],
      required: true,
      index: true,
    },
    categoryTitle: { type: String, required: true },
    categoryIcon: { type: String, required: true },
    categoryDescription: { type: String },
    title: { type: String, required: true },
    description: { type: String },
    icon: { type: String },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const CatalogServiceModel = model<ICatalogService>('Service', CatalogServiceSchema);
