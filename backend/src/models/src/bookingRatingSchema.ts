import { Schema } from 'mongoose';

export interface IServiceBookingRating {
  score: number;
  review?: string;
  tags?: string[];
  createdAt: Date;
}

export const ServiceBookingRatingSchema = new Schema<IServiceBookingRating>(
  {
    score: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, maxlength: 500 },
    tags: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);
