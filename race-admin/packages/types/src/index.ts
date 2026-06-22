export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  OPERATIONS_ADMIN = 'OPERATIONS_ADMIN',
  VERIFICATION_ADMIN = 'VERIFICATION_ADMIN',
  FINANCE_ADMIN = 'FINANCE_ADMIN',
  SUPPORT_ADMIN = 'SUPPORT_ADMIN',
}

export enum Permission {
  DASHBOARD_VIEW = 'DASHBOARD_VIEW',
  CUSTOMERS_VIEW = 'CUSTOMERS_VIEW',
  CUSTOMERS_MANAGE = 'CUSTOMERS_MANAGE',
  VENDORS_VIEW = 'VENDORS_VIEW',
  VENDORS_MANAGE = 'VENDORS_MANAGE',
  VENDORS_APPROVE = 'VENDORS_APPROVE',
  DRIVERS_VIEW = 'DRIVERS_VIEW',
  DRIVERS_MANAGE = 'DRIVERS_MANAGE',
  DRIVERS_APPROVE = 'DRIVERS_APPROVE',
  BOOKINGS_VIEW = 'BOOKINGS_VIEW',
  BOOKINGS_MANAGE = 'BOOKINGS_MANAGE',
  FINANCE_VIEW = 'FINANCE_VIEW',
  FINANCE_MANAGE = 'FINANCE_MANAGE',
  REPORTS_VIEW = 'REPORTS_VIEW',
  SUBSCRIPTIONS_VIEW = 'SUBSCRIPTIONS_VIEW',
  SUBSCRIPTIONS_MANAGE = 'SUBSCRIPTIONS_MANAGE',
  ADMIN_USERS_VIEW = 'ADMIN_USERS_VIEW',
  ADMIN_USERS_MANAGE = 'ADMIN_USERS_MANAGE',
  SETTINGS_VIEW = 'SETTINGS_VIEW',
  SETTINGS_MANAGE = 'SETTINGS_MANAGE',
  AUDIT_LOGS_VIEW = 'AUDIT_LOGS_VIEW',
  NOTIFICATIONS_VIEW = 'NOTIFICATIONS_VIEW',
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  permissions: Permission[];
  avatarUrl?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: AdminUser;
  tokens: AuthTokens;
}

export type TrendDirection = 'up' | 'down' | 'neutral';

export interface StatMetric {
  id: string;
  label: string;
  value: string | number;
  trend?: {
    value: string;
    direction: TrendDirection;
    label?: string;
  };
  icon?: string;
  variant?: 'default' | 'warning' | 'success';
}

export interface ChartDataPoint {
  label: string;
  current: number;
  previous: number;
}

export interface DonutSegment {
  name: string;
  value: number;
  color: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  type: 'vendor' | 'driver' | 'booking' | 'payment' | 'customer' | 'system';
}

export interface RecentBookingRow {
  id: string;
  bookingNumber: string;
  customerName: string;
  service: string;
  status: string;
  amount: number;
  createdAt: string;
}

export interface RecentVendorRow {
  id: string;
  name: string;
  type: string;
  status: string;
  submittedAt: string;
  city: string;
}

export interface DashboardData {
  stats: StatMetric[];
  revenueChart: ChartDataPoint[];
  bookingsChart: ChartDataPoint[];
  topServices: DonutSegment[];
  recentActivities: ActivityItem[];
  recentBookings: RecentBookingRow[];
  recentVendors: RecentVendorRow[];
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
