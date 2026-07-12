import type { UnifiedBookingStatus } from './bookingStatusConstants';

/** Customer + admin list: driver not accepted yet → show as pending (Ola/Uber style). */
export function mapPublicBookingStatus(status: string): string {
  if (status === 'DRIVER_ASSIGNED') {
    return 'PENDING';
  }
  return status;
}

/** Driver details visible to customer only after accept (en route or later). */
export function isDriverVisibleToCustomer(status: string): boolean {
  return (
    status === 'DRIVER_EN_ROUTE' ||
    status === 'DRIVER_ARRIVED' ||
    status === 'IN_PROGRESS' ||
    status === 'COMPLETED' ||
    status === 'RATED'
  );
}

export function mapPublicBookingStatusForHistory(
  status: string,
): UnifiedBookingStatus | string {
  return mapPublicBookingStatus(status);
}
