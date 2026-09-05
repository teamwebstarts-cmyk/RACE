import { z } from 'zod';

export const submitServiceBookingRatingSchema = z.object({
  rating: z.number().int().min(1).max(5),
  review: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
});

export type SubmitServiceBookingRatingDto = z.infer<typeof submitServiceBookingRatingSchema>;

export interface ServiceBookingRatingDto {
  score: number;
  review?: string;
  tags?: string[];
  createdAt: string;
}
