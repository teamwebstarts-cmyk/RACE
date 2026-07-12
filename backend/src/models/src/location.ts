import { Schema, model, type Document, Types } from 'mongoose';

export type LocationType = 'home' | 'work' | 'other';

export interface ISavedLocation extends Document {
  userId: Types.ObjectId;
  label: string;
  type: LocationType;
  address: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SavedLocationSchema = new Schema<ISavedLocation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    label: { type: String, required: true, trim: true },
    type: { type: String, enum: ['home', 'work', 'other'], default: 'other' },
    address: { type: String, required: true },
    latitude: { type: Number },
    longitude: { type: Number },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const SavedLocationModel = model<ISavedLocation>('SavedLocation', SavedLocationSchema);
