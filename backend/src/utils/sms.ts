import twilio from 'twilio';

export async function sendSms(to: string, otp: string): Promise<void> {
  const message = `Your RACE Service OTP is ${otp}. Valid for 5 minutes. Do not share with anyone.`;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
  const twilioConfigured = Boolean(accountSid && authToken && twilioPhone);

  // Always log the OTP in development so it can be read from the server console.
  if (process.env.NODE_ENV === 'development') {
    console.log(`[SMS DEV] To: ${to} | OTP: ${otp}`);
  }

  // If Twilio isn't configured, stop here (dev already logged the OTP above).
  if (!twilioConfigured) {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('[SMS] Twilio not configured — SMS not sent');
    }
    return;
  }

  try {
    const client = twilio(accountSid, authToken);

    const from = formatE164(twilioPhone ?? '');
    const toNumber = formatIndianMobile(to);

    await client.messages.create({
      body: message,
      from,
      to: toNumber,
    });

    console.log(`[SMS SENT] To: ${toNumber}`);
  } catch (error) {
    console.error(`[SMS ERROR] Failed to send to ${to}:`, error);
    // Don't throw — OTP still saved in DB and logged to console in dev.
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
