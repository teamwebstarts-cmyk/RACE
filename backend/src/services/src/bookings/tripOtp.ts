import { BadRequestError } from '../../../utils/src/errors';

/** 4-digit trip start code shown to customer (Ola/Uber style). */
export function generateTripStartOtp(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function assertTripStartOtp(
  booking: { tripStartOtp?: string | null; tripStartOtpVerified?: boolean | null },
  input: string | undefined,
): void {
  if (!booking.tripStartOtp) {
    throw new BadRequestError('Trip OTP is not ready yet. Wait for partner assignment.');
  }
  if (booking.tripStartOtpVerified) {
    throw new BadRequestError('Trip OTP was already verified');
  }
  const code = (input ?? '').trim();
  if (!/^\d{4}$/.test(code)) {
    throw new BadRequestError('Enter the 4-digit trip OTP from the customer');
  }
  if (booking.tripStartOtp !== code) {
    throw new BadRequestError('Invalid trip OTP. Ask the customer to share their code.');
  }
}

export function customerTripOtp(
  booking: { tripStartOtp?: string | null; tripStartOtpVerified?: boolean | null; status?: string },
): string | undefined {
  if (booking.tripStartOtpVerified) return undefined;
  if (!booking.tripStartOtp) return undefined;
  const active = ['DRIVER_EN_ROUTE', 'DRIVER_ARRIVED', 'IN_PROGRESS'].includes(
    booking.status ?? '',
  );
  return active ? booking.tripStartOtp : undefined;
}
