import { Schema, model, type Document } from 'mongoose';

import { AdminRole } from '../../services/src/admin/rbac';

export interface IAdmin extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  permissions: string[];
  avatarUrl?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: Object.values(AdminRole),
      required: true,
      index: true,
    },
    permissions: { type: [String], default: [] },
    avatarUrl: { type: String },
    isActive: { type: Boolean, default: true, index: true },
    lastLoginAt: { type: Date },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true },
);

export const AdminModel = model<IAdmin>('Admin', AdminSchema);
