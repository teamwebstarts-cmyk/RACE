import { Navigate, Route, Routes } from 'react-router-dom';

import { LoadingState } from '@race/ui';

import { ProtectedRoute, PublicOnlyRoute } from '@/components/guards/protected-route';
import { BookingDetailPage } from './pages/bookings/BookingDetailPage';
import { BookingsPage } from './pages/bookings/BookingsPage';
import { CustomerDetailPage } from './pages/customers/CustomerDetailPage';
import { CustomersPage } from './pages/customers/CustomersPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DriverDetailPage } from './pages/drivers/DriverDetailPage';
import { DriversPage } from './pages/drivers/DriversPage';
import { AvailableDriversPage } from './pages/drivers/AvailableDriversPage';
import { DashboardPage } from './pages/DashboardPage';
import { FinancialPage } from './pages/financial/FinancialPage';
import { LoginPage } from './pages/LoginPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { SubscriptionsPage } from './pages/subscriptions/SubscriptionsPage';
import { VendorDetailPage } from './pages/vendors/VendorDetailPage';
import { VendorsPage } from './pages/vendors/VendorsPage';
import { useAuthStore } from '@/stores/auth.store';

function RootRedirect() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  if (!hasHydrated) {
    return <LoadingState message="Loading session..." />;
  }

  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/customers/:id" element={<CustomerDetailPage />} />
          <Route path="/vendors" element={<VendorsPage />} />
          <Route path="/vendors/:id" element={<VendorDetailPage />} />
          <Route path="/drivers" element={<DriversPage />} />
          <Route path="/drivers/available" element={<AvailableDriversPage />} />
          <Route path="/drivers/:id" element={<DriverDetailPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/bookings/:id" element={<BookingDetailPage />} />
          <Route path="/financial" element={<FinancialPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/admin-users" element={<Navigate to="/profile" replace />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}
