import { useNavigate } from 'react-router-dom';

import { RegistrationLayout } from '../../../components/registration/RegistrationLayout';
import { TextField } from '../../../components/ui/TextField';
import { DRIVER_REGISTRATION_STEPS } from '../../../constants/registration';
import { usePartnerRegistrationStore } from '../../../store/partnerRegistrationStore';
import { useAuthStore } from '../../../store/authStore';

export function DriverPersonalPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const driverPersonal = usePartnerRegistrationStore((s) => s.driverPersonal);
  const setDriverPersonal = usePartnerRegistrationStore((s) => s.setDriverPersonal);

  return (
    <RegistrationLayout
      title="Driver Registration"
      steps={DRIVER_REGISTRATION_STEPS}
      activeStep={1}
      onContinue={() => {
        if (!driverPersonal.fullName.trim()) return;
        if (!driverPersonal.mobileNumber && user?.mobileNumber) {
          setDriverPersonal({ mobileNumber: user.mobileNumber });
        }
        navigate('/register/driver/vehicle');
      }}
      continueDisabled={!driverPersonal.fullName.trim()}
    >
      <p className="muted" style={{ marginBottom: 20 }}>
        Tell us who you are — this appears on your partner profile.
      </p>
      <TextField
        label="Full name"
        value={driverPersonal.fullName}
        onChange={(e) => setDriverPersonal({ fullName: e.target.value })}
        placeholder="Your full name"
      />
      <TextField
        label="Mobile number"
        value={driverPersonal.mobileNumber || user?.mobileNumber || ''}
        onChange={(e) => setDriverPersonal({ mobileNumber: e.target.value })}
        placeholder="10-digit mobile"
      />
      <TextField
        label="Email (optional)"
        type="email"
        value={driverPersonal.email}
        onChange={(e) => setDriverPersonal({ email: e.target.value })}
        placeholder="you@example.com"
      />
      <TextField
        label="Date of birth"
        type="date"
        value={driverPersonal.dateOfBirth}
        onChange={(e) => setDriverPersonal({ dateOfBirth: e.target.value })}
      />
      <TextField
        label="Address"
        value={driverPersonal.address}
        onChange={(e) => setDriverPersonal({ address: e.target.value })}
        placeholder="Street, area, city"
      />
    </RegistrationLayout>
  );
}
