import { logger } from '../../utils/src/logger';

export type NotificationEvent =
  | 'vendor_registration_submitted'
  | 'vendor_documents_approved'
  | 'vendor_documents_rejected'
  | 'vendor_approved'
  | 'vendor_rejected'
  | 'vendor_resubmission_required';

export interface NotificationPayload {
  userId: string;
  mobileNumber?: string;
  vendorId?: string;
  title: string;
  body: string;
  event: NotificationEvent;
  metadata?: Record<string, string>;
}

/**
 * Notification dispatcher — logs in development; wire FCM/SMS/email in production.
 */
export class NotificationService {
  async send(payload: NotificationPayload): Promise<void> {
    logger.info('Notification dispatched', {
      event: payload.event,
      userId: payload.userId,
      vendorId: payload.vendorId,
      title: payload.title,
    });

    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('\n══════ PARTNER NOTIFICATION ══════');
      // eslint-disable-next-line no-console
      console.log(`Event : ${payload.event}`);
      // eslint-disable-next-line no-console
      console.log(`User  : ${payload.userId}`);
      if (payload.mobileNumber) {
        // eslint-disable-next-line no-console
        console.log(`Phone : ${payload.mobileNumber}`);
      }
      // eslint-disable-next-line no-console
      console.log(`${payload.title}`);
      // eslint-disable-next-line no-console
      console.log(payload.body);
      // eslint-disable-next-line no-console
      console.log('══════════════════════════════════\n');
    }

    // Production hooks:
    // await pushProvider.send(payload.userId, { title, body });
    // await smsProvider.send(payload.mobileNumber, payload.body);
  }

  async notifyVendorSubmitted(userId: string, mobileNumber: string, vendorId: string): Promise<void> {
    await this.send({
      userId,
      mobileNumber,
      vendorId,
      event: 'vendor_registration_submitted',
      title: 'Application Submitted',
      body: 'Your RACE partner application has been submitted and is pending verification.',
    });
  }

  async notifyVendorApproved(userId: string, mobileNumber: string, vendorId: string): Promise<void> {
    await this.send({
      userId,
      mobileNumber,
      vendorId,
      event: 'vendor_approved',
      title: 'Partner Approved',
      body: 'Congratulations! Your RACE partner account has been approved. You can now receive bookings.',
    });
  }

  async notifyVendorRejected(
    userId: string,
    mobileNumber: string,
    vendorId: string,
    reason?: string,
  ): Promise<void> {
    await this.send({
      userId,
      mobileNumber,
      vendorId,
      event: 'vendor_rejected',
      title: 'Application Rejected',
      body: reason ?? 'Your partner application was not approved. Contact RACE support for details.',
      metadata: reason ? { reason } : undefined,
    });
  }

  async notifyResubmissionRequired(
    userId: string,
    mobileNumber: string,
    vendorId: string,
    note?: string,
  ): Promise<void> {
    await this.send({
      userId,
      mobileNumber,
      vendorId,
      event: 'vendor_resubmission_required',
      title: 'Documents Required',
      body: note ?? 'Please re-upload the requested documents to continue verification.',
      metadata: note ? { note } : undefined,
    });
  }
}

export const notificationService = new NotificationService();
