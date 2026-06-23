import type { LucideIcon } from 'lucide-react-native';
import { CreditCard, Smartphone, Wallet } from 'lucide-react-native';

export type BookingPaymentFlow = 'towing' | 'driver' | 'roadside';

export type PaymentMethodId = 'wallet' | 'upi' | 'card' | 'gpay';

export type PaymentMethodOption = {
  id: PaymentMethodId;
  label: string;
  subtitle: string;
  Icon: LucideIcon;
};

export const BOOKING_PAYMENT_METHODS: PaymentMethodOption[] = [
  { id: 'wallet', label: 'RACE Wallet', subtitle: '₹1,250 available', Icon: Wallet },
  { id: 'upi', label: 'UPI', subtitle: 'rahul@oksbi', Icon: Smartphone },
  { id: 'card', label: 'Visa •••• 4242', subtitle: 'Default card', Icon: CreditCard },
  { id: 'gpay', label: 'Google Pay', subtitle: 'Pay instantly', Icon: Smartphone },
];
