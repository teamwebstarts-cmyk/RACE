/**
 * Legacy customer booking create/rating DTOs removed.
 * Use combined-booking.validator.ts for GET /api/v1/bookings.
 * Towing/driver modules own create + detail endpoints.
 */
export type {
  CombinedBookingListItemDto,
  CombinedBookingListQuery,
} from './combined-booking.validator';
