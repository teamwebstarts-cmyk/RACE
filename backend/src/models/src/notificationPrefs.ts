import { Schema, model, type Document, Types } from 'mongoose';

export interface INotificationPrefs extends Document {
  userId: Types.ObjectId;
  pushEnabled: boolean;
  smsEnabled: boolean;
  emailEnabled: boolean;
  bookingUpdates: boolean;
  promotions: boolean;
  serviceLaunches: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationPrefsSchema = new Schema<INotificationPrefs>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    pushEnabled: { type: Boolean, default: true },
    smsEnabled: { type: Boolean, default: true },
    emailEnabled: { type: Boolean, default: false },
    bookingUpdates: { type: Boolean, default: true },
    promotions: { type: Boolean, default: true },
    serviceLaunches: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const NotificationPrefsModel = model<INotificationPrefs>(
  'NotificationPrefs',
  NotificationPrefsSchema,
);
