import type {
  ActiveBooking,
  BookingDetail,
  BookingHistoryItem,
  FutureService,
  NotificationItem,
  PaymentData,
  PricedService,
  SavedLocation,
  SubscriptionPlan,
  User,
  Vehicle,
} from '../types/models';

export const USER: User = {
  name: 'Rahul Kumar',
  phone: '+91 82494 72910',
  email: 'rahul.kumar@gmail.com',
  avatar: null,
  isVerified: true,
  isPremium: true,
  wallet: 1250,
  coupons: 4,
  rewards: 120,
  invoices: 12,
};

export const VEHICLE_1: Vehicle = {
  id: '1',
  type: 'Car',
  brand: 'Toyota',
  model: 'Innova Crysta',
  number: 'MH 12 AB 1234',
  color: 'Black',
  fuel: 'Petrol',
  isPrimary: true,
};

export const VEHICLE_2: Vehicle = {
  id: '2',
  type: 'Bike',
  brand: 'Honda',
  model: 'Activa 6G',
  number: 'MH 12 XY 5678',
  color: 'Red',
  fuel: 'Petrol',
  isPrimary: false,
};

export const VEHICLES: Vehicle[] = [VEHICLE_1, VEHICLE_2];

export const ACTIVE_BOOKING: ActiveBooking = {
  id: '#RACE78291',
  service: 'Towing Service',
  status: 'On The Way',
  pickup: 'Bhubaneswar (Patia Square)',
  drop: 'Cuttack Road, Odisha',
  eta: '23 min',
  driver: {
    name: 'Ramesh S.',
    rating: 4.9,
    photo: null,
    experience: '3 years',
  },
};

export const BOOKING_HISTORY: BookingHistoryItem[] = [
  {
    id: '1',
    service: 'Battery Jump Start',
    date: '12 May 2025, 10:15 AM',
    location: 'Bhubaneswar, Odisha',
    amount: 299,
    status: 'Completed',
  },
  {
    id: '2',
    service: 'Fuel Delivery',
    date: '09 May 2025, 06:40 PM',
    location: 'Bhubaneswar, Odisha',
    amount: 399,
    status: 'Completed',
  },
  {
    id: '3',
    service: 'Tyre Change',
    date: '05 May 2025, 02:30 PM',
    location: 'Bhubaneswar, Odisha',
    amount: 249,
    status: 'Completed',
  },
  {
    id: '4',
    service: 'Towing Service',
    date: '02 May 2025, 11:20 AM',
    location: 'Bhubaneswar, Odisha',
    amount: 799,
    status: 'Completed',
  },
];

export const TOWING_SERVICES: PricedService[] = [
  {
    id: '1',
    name: 'Instant Towing',
    description: 'Dispatched immediately',
    price: 499,
    icon: 'Zap',
  },
  {
    id: '2',
    name: 'Scheduled Towing',
    description: 'Book in advance',
    price: 399,
    icon: 'Calendar',
  },
  {
    id: '3',
    name: 'Emergency Towing',
    description: 'Priority emergency response',
    price: 699,
    icon: 'AlertCircle',
  },
];

export const DRIVER_SERVICES: PricedService[] = [
  {
    id: '1',
    name: 'Part-Time Driver',
    description: 'Few hours — errands & city trips',
    price: 199,
    unit: 'hr',
    icon: 'Clock',
  },
  {
    id: '2',
    name: 'Full-Time Driver',
    description: 'Daily or monthly dedicated driver',
    price: 999,
    unit: 'day',
    icon: 'Calendar',
  },
  {
    id: '3',
    name: 'Outstation Driver',
    description: 'Long distance & inter-city journeys',
    price: 1499,
    unit: 'trip',
    icon: 'MapPin',
  },
  {
    id: '4',
    name: 'Night Driver',
    description: 'Safe late-night driving',
    price: 299,
    unit: 'night',
    icon: 'Moon',
  },
];

export const ROADSIDE_SERVICES: PricedService[] = [
  {
    id: '1',
    name: 'Flat Tyre Assistance',
    description: 'Tyre change at your location',
    price: 199,
    icon: 'Circle',
  },
  {
    id: '2',
    name: 'Battery Jump Start',
    description: 'Dead battery? We fix it',
    price: 299,
    icon: 'Zap',
  },
  {
    id: '3',
    name: 'Fuel Delivery',
    description: 'Emergency fuel to your location',
    price: 149,
    icon: 'Droplets',
  },
  {
    id: '4',
    name: 'Minor Repairs',
    description: 'On-site mechanical fixes',
    price: 399,
    icon: 'Wrench',
  },
];

export const FUTURE_SERVICES: FutureService[] = [
  {
    id: '1',
    name: 'Car Wash',
    description: 'Professional car cleaning at doorstep',
    icon: 'Sparkles',
  },
  {
    id: '2',
    name: 'Vehicle Inspection',
    description: 'Pre-purchase & periodic health checks',
    icon: 'Search',
  },
  {
    id: '3',
    name: 'Insurance Assistance',
    description: 'Claims, renewals & insurance help',
    icon: 'Shield',
  },
  {
    id: '4',
    name: 'EV Charging Support',
    description: 'Mobile charging for electric vehicles',
    icon: 'BatteryCharging',
  },
  {
    id: '5',
    name: 'Ambulance Service',
    description: 'Emergency medical transport',
    icon: 'HeartPulse',
  },
  {
    id: '6',
    name: 'Corporate Fleet',
    description: 'Fleet management & bulk services',
    icon: 'Building2',
  },
  {
    id: '7',
    name: 'Vehicle Pickup & Drop',
    description: 'We collect & deliver your vehicle',
    icon: 'Car',
  },
  {
    id: '8',
    name: 'Mechanic on Demand',
    description: 'Certified mechanic on-site',
    icon: 'Wrench',
  },
];

export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Booking Confirmed!',
    message:
      'Your towing request #RACE78291 is confirmed. Driver arriving in 25 min.',
    time: '2 min ago',
    isRead: false,
    icon: 'Truck',
    type: 'booking',
  },
  {
    id: '2',
    title: 'Rate Your Experience',
    message: 'How was your Battery Jump Start service on 12 May?',
    time: '1 hour ago',
    isRead: false,
    icon: 'Star',
    type: 'review',
  },
  {
    id: '3',
    title: 'Special Offer!',
    message: 'Get 20% off on your next towing. Use code RACE20',
    time: 'Yesterday',
    isRead: true,
    icon: 'Tag',
    type: 'offer',
  },
  {
    id: '4',
    title: 'Booking Completed',
    message: 'Your Battery Jump Start service has been completed.',
    time: 'Yesterday',
    isRead: true,
    icon: 'CheckCircle',
    type: 'completed',
  },
  {
    id: '5',
    title: 'Payment Successful',
    message: 'Payment of ₹299 received successfully.',
    time: 'Yesterday',
    isRead: true,
    icon: 'IndianRupee',
    type: 'payment',
  },
];

export const SAVED_LOCATIONS: SavedLocation[] = [
  {
    id: '1',
    label: 'Home',
    address: '123, MG Road, Bhubaneswar, Odisha',
    icon: 'Home',
  },
  {
    id: '2',
    label: 'Office',
    address: 'Infocity, Patia, Bhubaneswar',
    icon: 'Building2',
  },
  {
    id: '3',
    label: 'Gym',
    address: 'Saheed Nagar, Bhubaneswar',
    icon: 'MapPin',
  },
];

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan[]> = {
  towing: [
    {
      id: '1',
      name: 'Basic',
      price: 299,
      features: [
        { text: '2 Towing requests/month', included: true },
        { text: '30 min response time', included: true },
        { text: 'Standard support', included: true },
        { text: 'Priority dispatch', included: false },
        { text: 'Free roadside assistance', included: false },
      ],
    },
    {
      id: '2',
      name: 'Premium',
      price: 599,
      isPopular: true,
      features: [
        { text: '5 Towing requests/month', included: true },
        { text: 'Priority 15 min response', included: true },
        { text: '24/7 Priority support', included: true },
        { text: 'Free roadside assistance', included: true },
        { text: 'Family coverage', included: false },
      ],
    },
    {
      id: '3',
      name: 'Family',
      price: 999,
      features: [
        { text: 'Unlimited towing requests', included: true },
        { text: 'Priority 10 min response', included: true },
        { text: '24/7 VIP support', included: true },
        { text: 'Free roadside assistance', included: true },
        { text: 'Up to 4 family vehicles', included: true },
      ],
    },
  ],
  driver: [
    {
      id: '1',
      name: 'Monthly Driver',
      price: 1499,
      features: [
        'Up to 4 hours/day',
        'Professional & verified',
        '24/7 support',
      ],
    },
    {
      id: '2',
      name: 'Corporate',
      price: 4999,
      features: [
        'Dedicated account manager',
        'Priority booking',
        'Custom billing',
      ],
    },
  ],
};

export const PAYMENT_DATA: PaymentData = {
  walletBalance: 1250,
  savedCard: {
    type: 'VISA',
    last4: '4242',
    holder: 'Rahul Kumar',
    expiry: '12/26',
    isDefault: true,
  },
  upi: 'rahul@oksbi',
  transactions: [
    { id: '1', type: 'credit', label: 'Wallet Recharge', date: '12 May', amount: 500 },
    { id: '2', type: 'debit', label: 'Battery Jump Start', date: '12 May', amount: 299 },
    { id: '3', type: 'debit', label: 'Towing Service', date: '02 May', amount: 899 },
    { id: '4', type: 'credit', label: 'Wallet Recharge', date: '28 Apr', amount: 1000 },
  ],
};

export const BOOKING_DETAIL: BookingDetail = {
  id: '#RACE78291',
  status: 'Completed',
  date: '12 May 2025, 09:45 AM',
  service: 'Towing Service',
  subService: 'Instant Towing',
  vehicle: 'Toyota Innova',
  towingType: 'Flatbed',
  pickup: 'Patia Square',
  drop: 'Cuttack Road',
  time: '09:15 AM',
  duration: '30 min',
  distance: '8 km',
  driver: {
    name: 'Ramesh S.',
    rating: 4.9,
    experience: '3 years',
  },
  payment: {
    baseFare: 699,
    distanceCharge: 150,
    platformFee: 50,
    total: 899,
    method: 'UPI',
  },
};
