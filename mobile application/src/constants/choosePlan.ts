import { SUBSCRIPTION_PLANS } from './demo';

export type BillingCycle = 'monthly' | 'yearly';

export function getPlanPrice(monthlyPrice: number, cycle: BillingCycle): number {
  if (cycle === 'monthly') return monthlyPrice;
  return Math.round(monthlyPrice * 12 * 0.8);
}

export function getPlanPriceLabel(monthlyPrice: number, cycle: BillingCycle): string {
  if (cycle === 'monthly') return `₹${monthlyPrice}/month`;
  const yearly = getPlanPrice(monthlyPrice, 'yearly');
  return `₹${yearly.toLocaleString('en-IN')}/year`;
}

export const TOWING_PLANS = SUBSCRIPTION_PLANS.towing;
export const DRIVER_PLANS = SUBSCRIPTION_PLANS.driver;
