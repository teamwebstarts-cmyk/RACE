export const UNIFIED_BOOKING_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'DRIVER_ASSIGNED',
  'DRIVER_EN_ROUTE',
  'DRIVER_ARRIVED',
  'IN_PROGRESS',
  'COMPLETED',
  'RATED',
  'CANCELLED',
] as const;

export type UnifiedBookingStatus = (typeof UNIFIED_BOOKING_STATUSES)[number];

export const BOOKING_STATUS_FLOW: UnifiedBookingStatus[] = [
  'PENDING',
  'CONFIRMED',
  'DRIVER_ASSIGNED',
  'DRIVER_EN_ROUTE',
  'DRIVER_ARRIVED',
  'IN_PROGRESS',
  'COMPLETED',
  'RATED',
];

export const TERMINAL_BOOKING_STATUSES: UnifiedBookingStatus[] = ['RATED', 'CANCELLED'];

export const BOOKING_PAYMENT_STATUSES = [
  'PENDING_ADVANCE',
  'ADVANCE_PAID',
  'PENDING_FINAL',
  'FULLY_PAID',
] as const;

export type BookingPaymentStatus = (typeof BOOKING_PAYMENT_STATUSES)[number];

export function canTransition(
  currentStatus: UnifiedBookingStatus,
  nextStatus: UnifiedBookingStatus,
): boolean {
  if (currentStatus === nextStatus) {
    return false;
  }

  if (TERMINAL_BOOKING_STATUSES.includes(currentStatus)) {
    return false;
  }

  if (nextStatus === 'CANCELLED') {
    return !['COMPLETED', 'RATED', 'CANCELLED'].includes(currentStatus);
  }

  const currentIndex = BOOKING_STATUS_FLOW.indexOf(currentStatus);
  const nextIndex = BOOKING_STATUS_FLOW.indexOf(nextStatus);

  if (currentIndex === -1 || nextIndex === -1) {
    return false;
  }

  return nextIndex === currentIndex + 1;
}
