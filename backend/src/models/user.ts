import { Schema, model, type Document } from 'mongoose';

import { computeProfileCompleted } from '../utils/user';

export type UserRole = 'customer' | 'vendor' | 'admin';

export interface IEmergencyContact {
  name: string;
  mobileNumber: string;
  relationship?: string;
}

export interface IAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

export interface IUser extends Document {
  mobileNumber: string;
  fullName?: string;
  email?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  dateOfBirth?: Date;
  emergencyContact?: IEmergencyContact;
  address?: IAddress;
  profilePhoto?: string;
  isVerified: boolean;
  isProfileCompleted: boolean;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const EmergencyContactSchema = new Schema<IEmergencyContact>(
  {
    name: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    relationship: { type: String },
  },
  { _id: false },
);

const AddressSchema = new Schema<IAddress>(
  {
    line1: { type: String },
    line2: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    country: { type: String, default: 'India' },
  },
  { _id: false },
);

const UserSchema = new Schema<IUser>(
  {
    mobileNumber: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true, sparse: true },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    },
    dateOfBirth: { type: Date },
    emergencyContact: { type: EmergencyContactSchema },
    address: { type: AddressSchema },
    profilePhoto: { type: String },
    isVerified: { type: Boolean, default: false },
    isProfileCompleted: { type: Boolean, default: false },
    role: { type: String, enum: ['customer', 'vendor', 'admin'], default: 'customer' },
  },
  { timestamps: true },
);

UserSchema.pre('save', function (next) {
  this.isProfileCompleted = computeProfileCompleted(this);
  next();
});

export const UserModel = model<IUser>('User', UserSchema);
