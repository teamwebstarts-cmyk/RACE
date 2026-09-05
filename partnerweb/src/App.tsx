import { Navigate, Outlet, Route, Routes } from 'react-router-dom';

import { MainLayout } from './components/navigation/MainLayout';
import { useAuthBootstrap } from './hooks/useAuthBootstrap';
import { AccountPage } from './pages/account/AccountPage';
import { SubscriptionsPage } from './pages/account/SubscriptionsPage';
import { VendorDriversPage } from './pages/account/VendorDriversPage';
import { VendorVehiclesPage } from './pages/account/VendorVehiclesPage';
import { VerificationPage } from './pages/account/VerificationPage';
import { LoginPage } from './pages/auth/LoginPage';
import { OtpPage } from './pages/auth/OtpPage';
import { RoleSelectionPage } from './pages/auth/RoleSelectionPage';
import { SplashPage } from './pages/auth/SplashPage';
import { WelcomePage } from './pages/auth/WelcomePage';
import { DashboardPage } from './pages/home/DashboardPage';
import { ActiveJobPage } from './pages/jobs/ActiveJobPage';
import { JobsPage } from './pages/jobs/JobsPage';
import { DriverDocumentsPage } from './pages/registration/driver/DriverDocumentsPage';
import { DriverPersonalPage } from './pages/registration/driver/DriverPersonalPage';
import { DriverReviewPage } from './pages/registration/driver/DriverReviewPage';
import { DriverVehiclePage } from './pages/registration/driver/DriverVehiclePage';
import { VendorAddressPage } from './pages/registration/vendor/VendorAddressPage';
import { VendorBusinessPage } from './pages/registration/vendor/VendorBusinessPage';
import { VendorDocumentsPage } from './pages/registration/vendor/VendorDocumentsPage';
import { VendorReviewPage } from './pages/registration/vendor/VendorReviewPage';
import { useAuthStore } from './store/authStore';
import { usePartnerOnboardingStore } from './store/partnerOnboardingStore';

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="spinner" />
    </div>
  );
}

function PublicOnly() {
  const canEnterApp = useAuthStore((s) => s.isAuthenticated && !s.onboardingRequired);
  if (canEnterApp) return <Navigate to="/app/dashboard" replace />;
  return <Outlet />;
}

function RegistrationOnly() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const onboardingRequired = useAuthStore((s) => s.onboardingRequired);
  const selectedRole = usePartnerOnboardingStore((s) => s.selectedRole);
  const user = useAuthStore((s) => s.user);
  const role = selectedRole || (user?.role === 'vendor' || user?.role === 'driver' ? user.role : null);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!onboardingRequired) return <Navigate to="/app/dashboard" replace />;
  if (!role) return <Navigate to="/role" replace />;

  return <Outlet />;
}

function ProtectedApp() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const onboardingRequired = useAuthStore((s) => s.onboardingRequired);
  const user = useAuthStore((s) => s.user);
  const selectedRole = usePartnerOnboardingStore((s) => s.selectedRole);
  const role = user?.role || selectedRole;

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (onboardingRequired) {
    const path =
      role === 'vendor' ? '/register/vendor/business' : '/register/driver/personal';
    return <Navigate to={path} replace />;
  }
  if (role !== 'vendor' && role !== 'driver') {
    return <Navigate to="/role" replace />;
  }

  return <Outlet />;
}

export default function App() {
  const { isLoading } = useAuthBootstrap();

  if (isLoading) return <LoadingScreen />;

  return (
    <Routes>
      <Route element={<PublicOnly />}>
        <Route path="/" element={<SplashPage />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/role" element={<RoleSelectionPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/otp" element={<OtpPage />} />
      </Route>

      <Route element={<RegistrationOnly />}>
        <Route path="/register/driver/personal" element={<DriverPersonalPage />} />
        <Route path="/register/driver/vehicle" element={<DriverVehiclePage />} />
        <Route path="/register/driver/documents" element={<DriverDocumentsPage />} />
        <Route path="/register/driver/review" element={<DriverReviewPage />} />
        <Route path="/register/vendor/business" element={<VendorBusinessPage />} />
        <Route path="/register/vendor/address" element={<VendorAddressPage />} />
        <Route path="/register/vendor/documents" element={<VendorDocumentsPage />} />
        <Route path="/register/vendor/review" element={<VendorReviewPage />} />
      </Route>

      <Route path="/app" element={<ProtectedApp />}>
        <Route element={<MainLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="jobs/active" element={<ActiveJobPage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="account/drivers" element={<VendorDriversPage />} />
          <Route path="account/vehicles" element={<VendorVehiclesPage />} />
          <Route path="account/subscriptions" element={<SubscriptionsPage />} />
          <Route path="account/verification" element={<VerificationPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
