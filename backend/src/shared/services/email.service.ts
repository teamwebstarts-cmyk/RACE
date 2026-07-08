import nodemailer from 'nodemailer';

import { env } from '../../config/env';
import { logger } from '../utils/logger';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT ?? 587,
      secure: false,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  return transporter;
}

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const mailer = getTransporter();

  if (!mailer) {
    logger.warn('SMTP not configured — OTP email not sent', { to });
    return;
  }

  await mailer.sendMail({
    from: env.SMTP_FROM,
    to,
    subject: 'Your RACE verification code',
    text: `Your RACE verification code is ${otp}. It expires in 5 minutes.`,
    html: `
      <p>Your RACE verification code is:</p>
      <p style="font-size:24px;font-weight:bold;letter-spacing:4px;">${otp}</p>
      <p>This code expires in 5 minutes. Do not share it with anyone.</p>
    `,
  });

  logger.info('OTP email sent', { to });
}
