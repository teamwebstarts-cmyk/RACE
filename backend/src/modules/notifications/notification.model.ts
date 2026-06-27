import { Schema, model, type Document, Types } from 'mongoose';

export type NotificationType =
  | 'BOOKING_CONFIRMED'
  | 'SERVICE_RATING'
  | 'PROMOTION'
  | 'BOOKING_COMPLETED'
  | 'PAYMENT_SUCCESS'
  | 'SOS_ALERT'
  | 'SUBSCRIPTION';

export interface INotification extends Document {
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: [
        'BOOKING_CONFIRMED',
        'SERVICE_RATING',
        'PROMOTION',
        'BOOKING_COMPLETED',
        'PAYMENT_SUCCESS',
        'SOS_ALERT',
        'SUBSCRIPTION',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

NotificationSchema.index({ userId: 1, createdAt: -1 });

export const NotificationModel = model<INotification>('Notification', NotificationSchema);
