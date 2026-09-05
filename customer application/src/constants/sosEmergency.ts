export const SOS_HOTLINES = [
  { id: 'race', label: 'RACE 24/7 Support', number: '1800-123-4567', primary: true },
  { id: 'police', label: 'Police', number: '100' },
  { id: 'ambulance', label: 'Ambulance', number: '108' },
  { id: 'fire', label: 'Fire', number: '101' },
];

export const SOS_QUICK_ACTIONS = [
  { id: 'scan', label: 'Scan Vehicle QR', icon: 'ScanLine' as const, route: 'QRScan' as const },
  { id: 'towing', label: 'Request Towing', icon: 'Truck' as const },
  { id: 'roadside', label: 'Roadside Help', icon: 'Wrench' as const },
  { id: 'location', label: 'Share My Location', icon: 'MapPin' as const },
];

export const SOS_VEHICLE_ACTIONS = [
  { id: 'contact', label: 'Contact Owner', icon: 'Phone' as const },
  { id: 'alert', label: 'Send Emergency Alert', icon: 'AlertCircle' as const },
  { id: 'towing', label: 'Request Towing', icon: 'Truck' as const },
  { id: 'location', label: 'Share Location', icon: 'MapPin' as const },
  { id: 'hospital', label: 'Nearest Hospital', icon: 'Hospital' as const },
];
