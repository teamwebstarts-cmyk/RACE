import type { AppSettings, AuditLogEntry } from '@race/types';

export const DEFAULT_SETTINGS: AppSettings = {
  general: {
    appName: 'RACE Service',
    supportEmail: 'support@raceservice.com',
    supportPhone: '+91 1800-123-4567',
    timezone: 'Asia/Kolkata',
    defaultLanguage: 'en',
  },
  notifications: {
    emailAlerts: true,
    smsAlerts: true,
    pushAlerts: true,
    bookingAlerts: true,
    vendorAlerts: true,
    financeAlerts: true,
  },
  payment: {
    currency: 'INR',
    commissionRate: 15,
    payoutCycle: 'weekly',
    minPayoutAmount: 500,
    enableWallet: true,
  },
  security: {
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    require2FA: false,
    passwordExpiryDays: 90,
  },
  service: {
    defaultServiceRadius: 25,
    maxBookingWaitMinutes: 45,
    enableSOS: true,
    enableSubscriptions: true,
  },
  terms: {
    termsUrl: 'https://raceservice.com/terms',
    privacyUrl: 'https://raceservice.com/privacy',
    refundPolicyUrl: 'https://raceservice.com/refund',
  },
  emailSms: {
    smtpHost: 'smtp.raceservice.com',
    smtpPort: 587,
    smtpUser: 'noreply@raceservice.com',
    smsProvider: 'Twilio',
    smsApiKey: '••••••••••••',
  },
  appearance: {
    primaryColor: '#F5A623',
    sidebarTheme: 'light',
    compactMode: false,
  },
};

export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'al1',
    action: 'Settings updated',
    user: 'Admin User',
    category: 'General',
    timestamp: '2025-06-17T10:00:00Z',
    details: 'Updated support email and timezone',
  },
  {
    id: 'al2',
    action: 'Vendor approved',
    user: 'Verification Admin',
    category: 'Vendor',
    timestamp: '2025-06-16T15:30:00Z',
    details: 'Approved RACE Towing Pvt Ltd',
  },
  {
    id: 'al3',
    action: 'Admin user created',
    user: 'Admin User',
    category: 'Admin',
    timestamp: '2025-06-15T11:00:00Z',
    details: 'Created support@raceservice.com',
  },
  {
    id: 'al4',
    action: 'Payment settings changed',
    user: 'Finance Admin',
    category: 'Payment',
    timestamp: '2025-06-14T09:20:00Z',
    details: 'Commission rate updated to 15%',
  },
  {
    id: 'al5',
    action: 'Security settings updated',
    user: 'Admin User',
    category: 'Security',
    timestamp: '2025-06-13T16:45:00Z',
    details: 'Enabled 2FA requirement',
  },
];

let settingsState = structuredClone(DEFAULT_SETTINGS);

export function getSettingsState() {
  return settingsState;
}

export function updateSettingsState(partial: Partial<AppSettings>) {
  settingsState = { ...settingsState, ...partial };
  if (partial.general) settingsState.general = { ...settingsState.general, ...partial.general };
  if (partial.notifications)
    settingsState.notifications = { ...settingsState.notifications, ...partial.notifications };
  if (partial.payment) settingsState.payment = { ...settingsState.payment, ...partial.payment };
  if (partial.security) settingsState.security = { ...settingsState.security, ...partial.security };
  if (partial.service) settingsState.service = { ...settingsState.service, ...partial.service };
  if (partial.terms) settingsState.terms = { ...settingsState.terms, ...partial.terms };
  if (partial.emailSms) settingsState.emailSms = { ...settingsState.emailSms, ...partial.emailSms };
  if (partial.appearance)
    settingsState.appearance = { ...settingsState.appearance, ...partial.appearance };
  return settingsState;
}

export function resetSettingsState() {
  settingsState = structuredClone(DEFAULT_SETTINGS);
  return settingsState;
}
