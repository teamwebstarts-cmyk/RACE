import { BadRequestError, ConflictError } from '../../../shared/utils/errors';
import {
  appendStatusHistory,
  assertValidStatusTransition,
} from './booking.helpers';
import type { UnifiedBookingStatus } from './booking-status.constants';
import type { SubmitServiceBookingRatingDto } from './booking-rating.validator';

export function assertCanSubmitServiceBookingRating(
  status: UnifiedBookingStatus,
  hasRating: boolean,
): void {
  if (hasRating) {
    throw new ConflictError('Rating already submitted for this booking');
  }

  if (status !== 'COMPLETED') {
    throw new BadRequestError('Booking must be completed before rating');
  }
}

export function buildServiceBookingRatingUpdate(
  status: UnifiedBookingStatus,
  statusHistory: Array<{ status: UnifiedBookingStatus; timestamp: Date }>,
  dto: SubmitServiceBookingRatingDto,
  hasRating: boolean,
) {
  assertCanSubmitServiceBookingRating(status, hasRating);
  assertValidStatusTransition(status, 'RATED');

  return {
    rating: {
      score: dto.rating,
      review: dto.review,
      tags: dto.tags,
      createdAt: new Date(),
    },
    status: 'RATED' as const,
    statusHistory: appendStatusHistory(statusHistory, 'RATED'),
  };
}
