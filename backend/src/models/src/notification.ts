import { Schema, model, type Document, Types } from 'mongoose';

export type NotificationAudience = 'admin' | 'customer' | 'vendor' | 'driver';

export type NotificationSeverity = 'info' | 'warning' | 'success' | 'error';

export type NotificationCategory =
  | 'vendor'
  | 'driver'
  | 'booking'
  | 'payment'
  | 'customer'
  | 'system'
  | 'subscription';

export type AppNotificationType =
  | 'BOOKING_CONFIRMED'
  | 'SERVICE_RATING'
  | 'PROMOTION'
  | 'BOOKING_COMPLETED'
  | 'PAYMENT_SUCCESS'
  | 'SOS_ALERT'
  | 'SUBSCRIPTION';

export type NotificationType = AppNotificationType;

export interface INotificationRecipient {
  audience: NotificationAudience;
  userId?: Types.ObjectId;
}

export interface INotification extends Document {
  recipient: INotificationRecipient;
  type?: AppNotificationType | NotificationSeverity;
  title: string;
  message: string;
  category?: NotificationCategory;
  isRead: boolean;
  metadata?: Record<string, string>;
  entityType?: string;
  entityId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: {
      audience: {
        type: String,
        enum: ['admin', 'customer', 'vendor', 'driver'],
        required: true,
        index: true,
      },
      userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    },
    type: { type: String },
    title: { type: String, required: true },
    message: { type: String, required: true },
    category: {
      type: String,
      enum: ['vendor', 'driver', 'booking', 'payment', 'customer', 'system', 'subscription'],
      default: 'system',
      index: true,
    },
    isRead: { type: Boolean, default: false, index: true },
    metadata: { type: Schema.Types.Mixed },
    entityType: { type: String },
    entityId: { type: String },
  },
  { timestamps: true },
);

NotificationSchema.index({ 'recipient.audience': 1, createdAt: -1 });
NotificationSchema.index({ 'recipient.userId': 1, createdAt: -1 });

export const NotificationModel = model<INotification>('Notification', NotificationSchema);
