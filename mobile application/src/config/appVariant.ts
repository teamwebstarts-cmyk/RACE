export type AppVariant = 'customer' | 'partner';

const rawVariant = process.env.EXPO_PUBLIC_APP_VARIANT?.trim().toLowerCase();

export const APP_VARIANT: AppVariant = rawVariant === 'partner' ? 'partner' : 'customer';

export const isPartnerApp = APP_VARIANT === 'partner';
