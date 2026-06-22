import type { DashboardData } from '@race/types';
import { delay } from '@race/utils';
import { appConfig } from '@race/config';

import type { DashboardFilters } from '../types';

const MOCK_DASHBOARD: DashboardData = {
  stats: [
    {
      id: 'customers',
      label: 'Total Customers',
      value: 12458,
      trend: { value: '+6.2%', direction: 'up', label: 'vs last month' },
      icon: 'Users',
    },
    {
      id: 'vendors',
      label: 'Total Vendors',
      value: 1249,
      trend: { value: '+5.4%', direction: 'up', label: 'vs last month' },
      icon: 'Building2',
    },
    {
      id: 'drivers',
      label: 'Total Drivers',
      value: 3865,
      trend: { value: '+4.7%', direction: 'up', label: 'vs last month' },
      icon: 'Car',
    },
    {
      id: 'active_bookings',
      label: 'Active Bookings',
      value: 568,
      trend: { value: '+12.1%', direction: 'up', label: 'vs last month' },
      icon: 'ClipboardList',
    },
    {
      id: 'completed_bookings',
      label: 'Completed Bookings',
      value: 1245,
      icon: 'CheckCircle2',
    },
    {
      id: 'revenue',
      label: 'Total Revenue',
      value: '₹18,45,300',
      trend: { value: '+15.4%', direction: 'up', label: 'vs last month' },
      icon: 'IndianRupee',
    },
    {
      id: 'pending_vendors',
      label: 'Pending Vendor Approvals',
      value: 18,
      variant: 'warning',
      icon: 'Hourglass',
    },
    {
      id: 'pending_drivers',
      label: 'Pending Driver Approvals',
      value: 26,
      variant: 'warning',
      icon: 'Hourglass',
    },
  ],
  revenueChart: [
    { label: 'Week 1', current: 420000, previous: 380000 },
    { label: 'Week 2', current: 510000, previous: 450000 },
    { label: 'Week 3', current: 480000, previous: 420000 },
    { label: 'Week 4', current: 435300, previous: 390000 },
  ],
  bookingsChart: [
    { label: 'Week 1', current: 280, previous: 240 },
    { label: 'Week 2', current: 320, previous: 290 },
    { label: 'Week 3', current: 310, previous: 275 },
    { label: 'Week 4', current: 335, previous: 300 },
  ],
  topServices: [
    { name: 'Towing Service', value: 45, color: '#F5A623' },
    { name: 'Driver Service', value: 25, color: '#2563EB' },
    { name: 'Roadside Assist', value: 20, color: '#16A34A' },
    { name: 'Other Services', value: 10, color: '#9CA3AF' },
  ],
  recentActivities: [
    {
      id: 'act_1',
      title: "New vendor 'Speed Tow Pvt Ltd' submitted",
      timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
      type: 'vendor',
    },
    {
      id: 'act_2',
      title: 'Driver Rahul Kumar accepted booking #BKA754',
      timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
      type: 'driver',
    },
    {
      id: 'act_3',
      title: 'Payment of ₹2,499 received for booking #BKA748',
      timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
      type: 'payment',
    },
    {
      id: 'act_4',
      title: 'Customer Priya Sharma registered a new vehicle',
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
      type: 'customer',
    },
    {
      id: 'act_5',
      title: 'Booking #BKA751 marked as completed',
      timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
      type: 'booking',
    },
  ],
  recentBookings: [
    {
      id: 'b1',
      bookingNumber: 'BKA754',
      customerName: 'Rahul Kumar',
      service: 'Instant Towing',
      status: 'EN_ROUTE',
      amount: 899,
      createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
    },
    {
      id: 'b2',
      bookingNumber: 'BKA753',
      customerName: 'Priya Sharma',
      service: 'Flat Tyre Assistance',
      status: 'COMPLETED',
      amount: 499,
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: 'b3',
      bookingNumber: 'BKA752',
      customerName: 'Amit Patel',
      service: 'Part-Time Driver',
      status: 'ASSIGNED',
      amount: 1199,
      createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    },
    {
      id: 'b4',
      bookingNumber: 'BKA751',
      customerName: 'Sneha Das',
      service: 'Emergency Towing',
      status: 'COMPLETED',
      amount: 1299,
      createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    },
    {
      id: 'b5',
      bookingNumber: 'BKA750',
      customerName: 'Vikram Singh',
      service: 'Battery Jump Start',
      status: 'CANCELLED',
      amount: 399,
      createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    },
  ],
  recentVendors: [
    {
      id: 'v1',
      name: 'Speed Tow Pvt Ltd',
      type: 'Towing',
      status: 'PENDING',
      submittedAt: new Date(Date.now() - 10 * 60000).toISOString(),
      city: 'Bhubaneswar',
    },
    {
      id: 'v2',
      name: 'Odisha Road Rescue',
      type: 'Roadside',
      status: 'APPROVED',
      submittedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
      city: 'Cuttack',
    },
    {
      id: 'v3',
      name: 'QuickLift Services',
      type: 'Towing',
      status: 'PENDING',
      submittedAt: new Date(Date.now() - 48 * 3600000).toISOString(),
      city: 'Puri',
    },
    {
      id: 'v4',
      name: 'DriveOn Partners',
      type: 'Driver',
      status: 'REJECTED',
      submittedAt: new Date(Date.now() - 72 * 3600000).toISOString(),
      city: 'Rourkela',
    },
  ],
};

export async function fetchDashboard(filters?: DashboardFilters): Promise<DashboardData> {
  await delay(appConfig.mockApiDelayMs);

  // Future: return apiClient.get('/admin/dashboard', { params: filters }).then(r => r.data.data);
  void filters;
  return structuredClone(MOCK_DASHBOARD);
}
