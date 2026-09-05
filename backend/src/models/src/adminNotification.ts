import { Schema, model, type Document, Types } from 'mongoose';

export interface IAdminNotification extends Document {
  title: string;
  message?: string;
  type: 'info' | 'warning' | 'success' | 'error';
  category: 'vendor' | 'driver' | 'booking' | 'payment' | 'customer' | 'system';
  isRead: boolean;
  adminId?: Types.ObjectId;
  entityType?: string;
  entityId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdminNotificationSchema = new Schema<IAdminNotification>(
  {
    title: { type: String, required: true },
    message: { type: String },
    type: { type: String, enum: ['info', 'warning', 'success', 'error'], default: 'info' },
    category: {
      type: String,
      enum: ['vendor', 'driver', 'booking', 'payment', 'customer', 'system'],
      default: 'system',
      index: true,
    },
    isRead: { type: Boolean, default: false, index: true },
    adminId: { type: Schema.Types.ObjectId, ref: 'Admin', index: true },
    entityType: { type: String },
    entityId: { type: String },
  },
  { timestamps: true },
);

AdminNotificationSchema.index({ createdAt: -1 });

export const AdminNotificationModel = model<IAdminNotification>(
  'AdminNotification',
  AdminNotificationSchema,
);
