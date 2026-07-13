import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { RegistrationLayout } from '../../../components/registration/RegistrationLayout';
import { DRIVER_REGISTRATION_STEPS } from '../../../constants/registration';
import { getApiErrorMessage } from '../../../services/api';
import { registerDriver } from '../../../services/driverService';
import { useAuthStore } from '../../../store/authStore';
import { usePartnerRegistrationStore } from '../../../store/partnerRegistrationStore';

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="review-row">
      <span className="muted">{label}</span>
      <strong>{value || '—'}</strong>
    </div>
  );
}

function mapVehicleToDriverType(vehicleType: string): 'Tow Driver' | 'Full-Time' | 'Part-Time' {
  const lower = vehicleType.toLowerCase();
  if (lower.includes('tow') || lower.includes('truck')) return 'Tow Driver';
  if (lower.includes('part')) return 'Part-Time';
  return 'Full-Time';
}

export function DriverReviewPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const completePartnerOnboarding = useAuthStore((s) => s.completePartnerOnboarding);
  const { driverPersonal, driverVehicle, driverDocuments, reset } =
    usePartnerRegistrationStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const result = await registerDriver({
        fullName: driverPersonal.fullName || user?.fullName || 'Driver',
        email: driverPersonal.email || undefined,
        address: driverPersonal.address || undefined,
        licenseNo: driverVehicle.rcNumber || `LIC-${Date.now().toString().slice(-6)}`,
        driverType: mapVehicleToDriverType(driverVehicle.vehicleType || 'car'),
        vehicleRegistration: driverVehicle.vehicleNumber || undefined,
        city: 'Bhubaneswar',
        vehicleType: driverVehicle.vehicleType || undefined,
      });

      await completePartnerOnboarding({
        ...(user ?? {
          id: result.id,
          mobileNumber: driverPersonal.mobileNumber || '',
          role: 'driver',
          isVerified: false,
          isProfileCompleted: true,
        }),
        role: 'driver',
        fullName: result.fullName || driverPersonal.fullName || user?.fullName,
        email: driverPersonal.email || user?.email,
        isProfileCompleted: true,
      });
      reset();
      navigate('/app/dashboard', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not submit driver application'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RegistrationLayout
      title="Driver Registration"
      steps={DRIVER_REGISTRATION_STEPS}
      activeStep={4}
      onBack={() => navigate('/register/driver/documents')}
      continueLabel={submitting ? 'Submitting…' : 'Submit Application'}
      onContinue={() => {
        if (!submitting) void submit();
      }}
      continueDisabled={submitting}
    >
      {error ? <div className="toast-error">{error}</div> : null}
      <div className="review-banner">
        <CheckCircle2 size={28} color="#F5A800" />
        <div>
          <h3>Review your application</h3>
          <p className="muted">
            After submit, admin approval may be required before you receive jobs.
          </p>
        </div>
      </div>

      <h3 className="section-title">Personal Information</h3>
      <div className="review-card">
        <ReviewRow label="Full Name" value={driverPersonal.fullName} />
        <ReviewRow label="Mobile" value={driverPersonal.mobileNumber} />
        <ReviewRow label="Email" value={driverPersonal.email} />
        <ReviewRow label="Date of Birth" value={driverPersonal.dateOfBirth} />
        <ReviewRow label="Address" value={driverPersonal.address} />
      </div>

      <h3 className="section-title">Vehicle Information</h3>
      <div className="review-card">
        <ReviewRow label="Vehicle Type" value={driverVehicle.vehicleType} />
        <ReviewRow label="Vehicle Number" value={driverVehicle.vehicleNumber} />
        <ReviewRow label="RC Number" value={driverVehicle.rcNumber} />
        <ReviewRow label="Insurance" value={driverVehicle.insuranceProvider} />
        <ReviewRow label="Policy Number" value={driverVehicle.insurancePolicyNumber} />
        <ReviewRow label="Model" value={driverVehicle.vehicleModel} />
      </div>

      <h3 className="section-title">Documents ({driverDocuments.length})</h3>
      <div className="review-card">
        {driverDocuments.length === 0 ? (
          <p className="muted">No documents uploaded</p>
        ) : (
          driverDocuments.map((doc) => (
            <ReviewRow
              key={doc.id}
              label={doc.label}
              value={doc.mimeType === 'application/pdf' ? `PDF · ${doc.name}` : 'Uploaded'}
            />
          ))
        )}
      </div>
    </RegistrationLayout>
  );
}
