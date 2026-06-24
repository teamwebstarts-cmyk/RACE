export function mapActivityType(entityType: string): 'vendor' | 'driver' | 'booking' | 'payment' | 'customer' | 'system' {
  if (entityType.includes('vendor')) return 'vendor';
  if (entityType.includes('driver')) return 'driver';
  if (entityType.includes('booking')) return 'booking';
  if (entityType.includes('transaction') || entityType.includes('payment')) return 'payment';
  if (entityType.includes('customer') || entityType.includes('user')) return 'customer';
  return 'system';
}

export function driverInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')
      .slice(0, 2) || 'DR'
  );
}

export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function mapVendorTypeLabel(type?: string): string {
  if (!type) return '—';
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function mapLocationPoint(loc?: {
  label?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}) {
  return {
    address: loc?.address ?? loc?.label ?? '—',
    lat: loc?.latitude ?? 20.2961,
    lng: loc?.longitude ?? 85.8245,
  };
}

export function mapDocStatus(status: string): 'VERIFIED' | 'PENDING' | 'REJECTED' {
  if (status === 'VERIFIED') return 'VERIFIED';
  if (status === 'REJECTED') return 'REJECTED';
  return 'PENDING';
}
