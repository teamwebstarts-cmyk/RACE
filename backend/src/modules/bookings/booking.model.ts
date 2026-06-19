import { Schema, model, type Document, Types } from 'mongoose';

export type BookingStatus =
  | 'CREATED'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'SERVICE_STARTED'
  | 'SERVICE_COMPLETED'
  | 'PAYMENT_PENDING'
  | 'PAID';

export interface IBookingLocation {
  label: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

export interface IBookingDriver {
  id: string;
  name: string;
  rating: number;
  phone: string;
  avatarUrl?: string;
  experience?: string;
  verified?: boolean;
}

export interface IBookingInvoice {
  baseFare: number;
  distanceCharge?: number;
  platformFee?: number;
  discount?: number;
  total: number;
  currency: string;
  paymentMethod?: string;
}

export interface IBookingRating {
  score: number;
  review?: string;
  tipAmount?: number;
  tags?: string[];
  createdAt: Date;
}

export interface IStatusHistoryEntry {
  status: BookingStatus;
  timestamp: Date;
}

export interface IBooking extends Document {
  customerId: Types.ObjectId;
  bookingNumber: string;
  categoryId: string;
  serviceId: string;
  serviceLabel: string;
  serviceDescription?: string;
  status: BookingStatus;
  vehicleId: Types.ObjectId;
  vehicleNumber: string;
  vehicleLabel?: string;
  pickup: IBookingLocation;
  dropoff?: IBookingLocation;
  scheduledAt?: Date;
  driver?: IBookingDriver;
  etaMinutes?: number;
  distanceKm?: number;
  durationMinutes?: number;
  invoice?: IBookingInvoice;
  statusHistory: IStatusHistoryEntry[];
  rating?: IBookingRating;
  driverLatitude?: number;
  driverLongitude?: number;
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema = new Schema<IBookingLocation>(
  {
    label: { type: String, required: true },
    address: { type: String, required: true },
    latitude: { type: Number },
    longitude: { type: Number },
  },
  { _id: false },
);

const DriverSchema = new Schema<IBookingDriver>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    phone: { type: String, required: true },
    avatarUrl: { type: String },
    experience: { type: String },
    verified: { type: Boolean, default: true },
  },
  { _id: false },
);

const InvoiceSchema = new Schema<IBookingInvoice>(
  {
    baseFare: { type: Number, required: true },
    distanceCharge: { type: Number },
    platformFee: { type: Number },
    discount: { type: Number },
    total: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    paymentMethod: { type: String },
  },
  { _id: false },
);

const RatingSchema = new Schema<IBookingRating>(
  {
    score: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String },
    tipAmount: { type: Number },
    tags: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const StatusHistorySchema = new Schema<IStatusHistoryEntry>(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false },
);

const BookingSchema = new Schema<IBooking>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    bookingNumber: { type: String, required: true, unique: true },
    categoryId: { type: String, required: true },
    serviceId: { type: String, required: true },
    serviceLabel: { type: String, required: true },
    serviceDescription: { type: String },
    status: {
      type: String,
      enum: [
        'CREATED',
        'ASSIGNED',
        'ACCEPTED',
        'EN_ROUTE',
        'ARRIVED',
        'SERVICE_STARTED',
        'SERVICE_COMPLETED',
        'PAYMENT_PENDING',
        'PAID',
      ],
      default: 'CREATED',
      index: true,
    },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    vehicleNumber: { type: String, required: true },
    vehicleLabel: { type: String },
    pickup: { type: LocationSchema, required: true },
    dropoff: { type: LocationSchema },
    scheduledAt: { type: Date },
    driver: { type: DriverSchema },
    etaMinutes: { type: Number },
    distanceKm: { type: Number },
    durationMinutes: { type: Number },
    invoice: { type: InvoiceSchema },
    statusHistory: { type: [StatusHistorySchema], default: [] },
    rating: { type: RatingSchema },
    driverLatitude: { type: Number },
    driverLongitude: { type: Number },
  },
  { timestamps: true },
);

BookingSchema.index({ customerId: 1, createdAt: -1 });

export const BookingModel = model<IBooking>('Booking', BookingSchema);
