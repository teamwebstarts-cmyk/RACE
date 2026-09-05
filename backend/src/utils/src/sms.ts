import twilio from 'twilio';

import { AppError } from './errors';
import { logger } from './logger';

function logDevOtp(to: string, otp: string): void {
  const toNumber = formatIndianMobile(to);
  const banner = `══════ DEV OTP ══════  ${toNumber}  →  ${otp}  ══════════════════`;
  console.log(`\n${banner}\n`);
  logger.info('DEV OTP (use in app — SMS not sent)', { to: toNumber, otp });
}

/**
 * Sends OTP via Twilio SMS.
 * Customer app and Partner app share this path — no fixed/demo OTP.
 */
export async function sendSms(to: string, otp: string): Promise<void> {
  const message = `Your RACE Service OTP is ${otp}. Valid for 5 minutes. Do not share with anyone.`;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
  const twilioConfigured = Boolean(accountSid && authToken && twilioPhone);

  if (!twilioConfigured) {
    if (process.env.NODE_ENV !== 'production') {
      logDevOtp(to, otp);
      return;
    }

    throw new AppError(
      'SMS service is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER.',
      503,
    );
  }

  const toNumber = formatIndianMobile(to);

  try {
    const client = twilio(accountSid, authToken);
    const from = formatE164(twilioPhone ?? '');

    await client.messages.create({
      body: message,
      from,
      to: toNumber,
    });

    console.log(`[SMS SENT] To: ${toNumber}`);
  } catch (error) {
    console.error(`[SMS ERROR] Failed to send to ${toNumber}:`, error);

    // Dev fallback: Twilio trial only texts verified numbers — still allow login via terminal OTP.
    if (process.env.NODE_ENV !== 'production') {
      logDevOtp(toNumber, otp);
      return;
    }

    throw new AppError('Failed to send OTP SMS. Please try again.', 502);
  }
}

function formatIndianMobile(mobile: string): string {
  const digits = mobile.replace(/\D/g, '').replace(/^91/, '');
  return `+91${digits}`;
}

function formatE164(phone: string): string {
  const trimmed = phone.trim();
  if (trimmed.startsWith('+')) {
    return trimmed;
  }
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  return `+${digits}`;
}
