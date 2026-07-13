import { Navigate, Outlet, Route, Routes } from 'react-router-dom';

import { MainLayout } from './components/navigation/MainLayout';
import { useAuthBootstrap } from './hooks/useAuthBootstrap';
import { CreateAccountPage } from './pages/auth/CreateAccountPage';
import { CreatePinPage } from './pages/auth/CreatePinPage';
import { LoginPage } from './pages/auth/LoginPage';
import { OnboardingPage } from './pages/auth/OnboardingPage';
import { OtpPage } from './pages/auth/OtpPage';
import { ProfileSetupPage } from './pages/auth/ProfileSetupPage';
import { QrCodePage } from './pages/auth/QrCodePage';
import { SplashPage } from './pages/auth/SplashPage';
import { VehicleRegistrationPage } from './pages/auth/VehicleRegistrationPage';
import { BookingDetailPage } from './pages/bookings/BookingDetailPage';
import { BookingsPage } from './pages/bookings/BookingsPage';
import { CreateBookingPage } from './pages/bookings/CreateBookingPage';
import { HomePage } from './pages/home/HomePage';
import { SelectLocationPage } from './pages/home/SelectLocationPage';
import { AddVehiclePage } from './pages/profile/AddVehiclePage';
import {
  HelpSupportPage,
  NotificationsPage,
  SavedLocationsPage,
  SettingsPage,
} from './pages/profile/MiscProfilePages';
import { MyVehiclesPage } from './pages/profile/MyVehiclesPage';
import { PersonalInfoPage } from './pages/profile/PersonalInfoPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { VehicleDetailPage } from './pages/profile/VehicleDetailPage';
import { ComingSoonPage } from './pages/services/ComingSoonPage';
import { CategoryDetailPage } from './pages/services/CategoryDetailPage';
import { ServiceDetailPage } from './pages/services/ServiceDetailPage';
import { ServicesPage } from './pages/services/ServicesPage';
import { CallPage } from './pages/sos/CallPage';
import { QrScanPage } from './pages/sos/QrScanPage';
import { useAuthStore } from './store/authStore';

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="spinner" />
    </div>
  );
}

function PublicOnly() {
  const canEnterApp = useAuthStore(
    (s) => s.isAuthenticated && !s.onboardingRequired,
  );
  if (canEnterApp) return <Navigate to="/app/home" replace />;
  return <Outlet />;
}

function OnboardingOnly() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const onboardingRequired = useAuthStore((s) => s.onboardingRequired);
  const step = useAuthStore((s) => s.customerOnboardingStep);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!onboardingRequired) return <Navigate to="/app/home" replace />;

  // Soft redirect if user lands on wrong onboarding step URL.
  if (step === 'profile') {
    /* allow profile routes */
  }

  return <Outlet />;
}

function ProtectedApp() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const onboardingRequired = useAuthStore((s) => s.onboardingRequired);
  const step = useAuthStore((s) => s.customerOnboardingStep);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (onboardingRequired) {
    if (step === 'pin') return <Navigate to="/onboarding/pin" replace />;
    if (step === 'vehicle') return <Navigate to="/onboarding/vehicle" replace />;
    return <Navigate to="/onboarding/profile" replace />;
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
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create-account" element={<CreateAccountPage />} />
        <Route path="/otp" element={<OtpPage />} />
      </Route>

      <Route element={<OnboardingOnly />}>
        <Route path="/onboarding/profile" element={<ProfileSetupPage />} />
        <Route path="/onboarding/vehicle" element={<VehicleRegistrationPage />} />
        <Route path="/onboarding/qr" element={<QrCodePage />} />
        <Route path="/onboarding/pin" element={<CreatePinPage />} />
      </Route>

      <Route path="/app" element={<ProtectedApp />}>
        <Route element={<MainLayout />}>
          <Route path="home" element={<HomePage />} />
          <Route path="home/location" element={<SelectLocationPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="services/coming-soon" element={<ComingSoonPage />} />
          <Route path="services/:categoryId" element={<CategoryDetailPage />} />
          <Route path="services/:categoryId/:serviceId" element={<ServiceDetailPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="bookings/new" element={<CreateBookingPage />} />
          <Route path="bookings/:id" element={<BookingDetailPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/personal" element={<PersonalInfoPage />} />
          <Route path="profile/vehicles" element={<MyVehiclesPage />} />
          <Route path="profile/vehicles/add" element={<AddVehiclePage />} />
          <Route path="profile/vehicles/:id" element={<VehicleDetailPage />} />
          <Route path="profile/locations" element={<SavedLocationsPage />} />
          <Route path="profile/notifications" element={<NotificationsPage />} />
          <Route path="profile/settings" element={<SettingsPage />} />
          <Route path="profile/help" element={<HelpSupportPage />} />
          <Route path="call" element={<CallPage />} />
          <Route path="call/qr" element={<QrScanPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
