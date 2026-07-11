import {
  Ambulance,
  Building2,
  Car,
  ClipboardCheck,
  Shield,
  Truck,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';

export const MORE_SERVICES_ITEMS: Array<{
  id: string;
  title: string;
  description: string;
  Icon: LucideIcon;
}> = [
  {
    id: 'car_wash',
    title: 'Car Wash',
    description: 'Professional car cleaning at your doorstep',
    Icon: Car,
  },
  {
    id: 'inspection',
    title: 'Vehicle Inspection',
    description: 'Pre-purchase & periodic health checks',
    Icon: ClipboardCheck,
  },
  {
    id: 'insurance',
    title: 'Insurance Assistance',
    description: 'Claims, renewals & roadside insurance help',
    Icon: Shield,
  },
  {
    id: 'ev_charging',
    title: 'EV Charging Support',
    description: 'Mobile charging for electric vehicles',
    Icon: Zap,
  },
  {
    id: 'ambulance',
    title: 'Ambulance Service',
    description: 'Emergency medical transport coordination',
    Icon: Ambulance,
  },
  {
    id: 'fleet',
    title: 'Corporate Fleet',
    description: 'Fleet management & bulk services for businesses',
    Icon: Building2,
  },
  {
    id: 'pickup_drop',
    title: 'Vehicle Pickup & Drop',
    description: 'We collect & deliver your vehicle',
    Icon: Truck,
  },
  {
    id: 'mechanic',
    title: 'Mechanic on Demand',
    description: 'Certified mechanic dispatched on-site',
    Icon: Wrench,
  },
];
