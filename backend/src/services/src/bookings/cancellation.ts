export type CancellationResult = {
  canCancel: boolean;
  refundAmount: number;
  refundPercent: number;
  reason: string;
  cancellationFee: number;
};

export function getCancellationPolicy(
  status: string,
  advancePaid: boolean,
  advanceAmount: number,
  _scheduledAt?: Date,
): CancellationResult {
  if (status === 'PENDING' && !advancePaid) {
    return {
      canCancel: true,
      refundAmount: 0,
      refundPercent: 0,
      cancellationFee: 0,
      reason: 'Free cancellation - no payment made',
    };
  }

  if (status === 'CONFIRMED') {
    return {
      canCancel: true,
      refundAmount: advanceAmount,
      refundPercent: 100,
      cancellationFee: 0,
      reason: 'Full refund - driver not yet assigned',
    };
  }

  if (status === 'DRIVER_ASSIGNED') {
    const refundAmount = Math.round(advanceAmount * 0.5);
    return {
      canCancel: true,
      refundAmount,
      refundPercent: 50,
      cancellationFee: Math.round(advanceAmount * 0.5),
      reason: '50% refund - driver was assigned',
    };
  }

  if (status === 'DRIVER_EN_ROUTE' || status === 'DRIVER_ARRIVED') {
    return {
      canCancel: true,
      refundAmount: 0,
      refundPercent: 0,
      cancellationFee: advanceAmount,
      reason: 'No refund - driver is already on the way',
    };
  }

  if (['IN_PROGRESS', 'COMPLETED', 'RATED', 'CANCELLED'].includes(status)) {
    return {
      canCancel: false,
      refundAmount: 0,
      refundPercent: 0,
      cancellationFee: 0,
      reason: 'Cannot cancel at this stage',
    };
  }

  return {
    canCancel: false,
    refundAmount: 0,
    refundPercent: 0,
    cancellationFee: 0,
    reason: 'Cannot cancel at this stage',
  };
}
