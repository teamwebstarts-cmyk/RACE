/**
 * SMS / OTP delivery via MessageCentral VerifyNow.
 *
 * Flow:
 *   1. sendOtp()       → POST /verification/v3/send   → returns verificationId
 *   2. validateOtp()   → GET  /verification/v3/validateOtp?verificationId=…&code=… → 200 = ok
 *
 * MessageCentral manages OTP generation & digit comparison on their servers.
 * We only store the verificationId in the OtpLog for the subsequent validate call.
 *
 * Dev/mock bypass: when MC_CUSTOMER_ID is absent, OTP is printed to console and
 * MOCK_UNIVERSAL_OTP is accepted in the verify step (handled in otp.ts).
 */

import { logger } from './logger';
import { AppError } from './errors';

/** Shown to mobile/admin clients when an OTP session or SMS code is no longer valid. */
export const OTP_EXPIRED_USER_MESSAGE =
  'This code has expired. Tap Resend OTP for a new code.';

const OTP_SEND_FAILED_USER_MESSAGE =
  'We could not send a code right now. Please try again in a moment.';

const OTP_VERIFY_FAILED_USER_MESSAGE =
  'Could not verify the code. Tap Resend OTP and try again.';

const OTP_SERVICE_UNAVAILABLE_MESSAGE =
  'Sign-in is temporarily unavailable. Please try again shortly.';

function isMcExpiredSignal(responseCode: number, rawMessage: string): boolean {
  const msg = rawMessage.toUpperCase();
  return (
    responseCode === 700 ||
    msg.includes('EXPIRED') ||
    msg.includes('VERIFICATION_EXPIRED')
  );
}

function getMcConfig() {
  const customerId = process.env.MC_CUSTOMER_ID;
  const authToken = process.env.MC_AUTH_TOKEN;
  const baseUrl = process.env.MC_BASE_URL ?? 'https://cpaas.messagecentral.com';
  return { customerId, authToken, baseUrl };
}

export interface McSendResult {
  verificationId: string;
}

/**
 * Extract the 10-digit local part of an Indian mobile number.
 * MessageCentral expects just the 10-digit number + countryCode=91.
 */
function extractTenDigit(mobile: string): string {
  const digits = mobile.replace(/\D/g, '').replace(/^91/, '');
  return digits.slice(-10);
}

/**
 * Send OTP via MessageCentral VerifyNow.
 * Returns { verificationId } that must be stored and passed back to validateOtp().
 * Throws AppError on failure.
 */
export async function mcSendOtp(to: string): Promise<McSendResult> {
  const { customerId, authToken, baseUrl } = getMcConfig();
  if (!customerId || !authToken) {
    throw new AppError(OTP_SERVICE_UNAVAILABLE_MESSAGE, 503);
  }

  const mobile = extractTenDigit(to);
  const url = new URL(`${baseUrl}/verification/v3/send`);
  url.searchParams.set('countryCode', '91');
  url.searchParams.set('customerId', customerId);
  url.searchParams.set('flowType', 'SMS');
  url.searchParams.set('mobileNumber', mobile);
  // VerifyNow defaults to 4 digits. The customer app and API expect 6.
  url.searchParams.set('otpLength', '6');
  url.searchParams.set('type', 'OTP');

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      authToken,
      'Content-Type': 'application/json',
    },
  });

  const body = await res.json() as {
    responseCode: number;
    message: string;
    data?: { verificationId?: string; errorMessage?: string };
  };

  logger.info('MessageCentral send-OTP response', {
    mobile,
    responseCode: body.responseCode,
    message: body.message,
    verificationId: body.data?.verificationId,
  });

  // 200 = SUCCESS, 506 = REQUEST_ALREADY_EXISTS (idempotent — same verificationId reused)
  if (body.responseCode === 200 || body.responseCode === 506) {
    const verificationId = body.data?.verificationId;
    if (!verificationId) {
      logger.error('MessageCentral send-OTP missing verificationId', {
        mobile,
        responseCode: body.responseCode,
        message: body.message,
      });
      throw new AppError(OTP_SEND_FAILED_USER_MESSAGE, 502);
    }
    return { verificationId };
  }

  logger.warn('MessageCentral send-OTP failed', {
    mobile,
    responseCode: body.responseCode,
    message: body.message,
  });
  throw new AppError(OTP_SEND_FAILED_USER_MESSAGE, 502);
}

/**
 * Validate OTP digit via MessageCentral server-side check.
 * Returns true if OTP is correct, false if wrong.
 * Throws AppError on network/service failure.
 */
export async function mcValidateOtp(
  to: string,
  verificationId: string,
  code: string,
): Promise<boolean> {
  const { customerId, authToken, baseUrl } = getMcConfig();
  if (!customerId || !authToken) {
    throw new AppError(OTP_SERVICE_UNAVAILABLE_MESSAGE, 503);
  }

  const mobile = extractTenDigit(to);
  const url = new URL(`${baseUrl}/verification/v3/validateOtp`);
  url.searchParams.set('countryCode', '91');
  url.searchParams.set('mobileNumber', mobile);
  url.searchParams.set('verificationId', String(verificationId));
  url.searchParams.set('customerId', customerId);
  url.searchParams.set('code', code);

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { authToken },
  });

  const body = (await res.json()) as {
    responseCode: number;
    message: string;
    data?: unknown;
  };

  logger.info('MessageCentral validate-OTP response', {
    mobile,
    verificationId,
    responseCode: body.responseCode,
    message: body.message,
  });

  // 200 = VERIFICATION_COMPLETED (correct OTP)
  // 702 = WRONG_OTP_PROVIDED
  // 700 = OTP_EXPIRED
  if (body.responseCode === 200) {
    return true;
  }

  if (body.responseCode === 702) {
    return false; // wrong OTP — caller increments attempt counter
  }

  if (isMcExpiredSignal(body.responseCode, body.message ?? '')) {
    throw new AppError(OTP_EXPIRED_USER_MESSAGE, 400);
  }

  logger.warn('MessageCentral validate-OTP unexpected response', {
    mobile,
    verificationId,
    responseCode: body.responseCode,
    message: body.message,
  });
  throw new AppError(OTP_VERIFY_FAILED_USER_MESSAGE, 400);
}

/**
 * Prints OTP to console for local dev when MessageCentral is not configured.
 */
export function logDevOtp(to: string, otp: string): void {
  const banner = `══════ DEV OTP ══════  ${to}  →  ${otp}  ══════════════════`;
  console.log(`\n${banner}\n`);
  logger.info('DEV OTP (use in app — SMS not sent)', { to, otp });
}

/**
 * Check whether MessageCentral credentials are available.
 */
export function isMcConfigured(): boolean {
  const { customerId, authToken } = getMcConfig();
  return Boolean(customerId && authToken);
}
