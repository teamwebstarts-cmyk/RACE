import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { RegistrationLayout } from '../../../components/registration/RegistrationLayout';
import {
  VENDOR_DOC_TYPE_MAP,
  VENDOR_REGISTRATION_STEPS,
} from '../../../constants/registration';
import { getApiErrorMessage } from '../../../services/api';
import { refreshAuthSession } from '../../../services/authService';
import { registerVendor, uploadVendorDocument } from '../../../services/vendorService';
import { useAuthStore } from '../../../store/authStore';
import { usePartnerRegistrationStore } from '../../../store/partnerRegistrationStore';
import type { VendorType } from '../../../types/vendor';

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="review-row">
      <span className="muted">{label}</span>
      <strong>{value || '—'}</strong>
    </div>
  );
}

function mapBusinessType(value: string): VendorType {
  const lower = value.toLowerCase();
  if (lower.includes('tow') && lower.includes('truck')) return 'tow_truck_driver';
  if (lower.includes('mechanic')) return 'mechanic';
  if (lower.includes('full')) return 'full_time_driver';
  if (lower.includes('part')) return 'part_time_driver';
  return 'towing_company';
}

export function VendorReviewPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const completePartnerOnboarding = useAuthStore((s) => s.completePartnerOnboarding);
  const { vendorBusiness, vendorAddress, vendorDocuments, reset } =
    usePartnerRegistrationStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const address = [
        vendorAddress.addressLine1,
        vendorAddress.addressLine2,
        vendorAddress.city,
        vendorAddress.state,
        vendorAddress.pinCode,
      ]
        .filter(Boolean)
        .join(', ');

      await registerVendor({
        vendorType: mapBusinessType(vendorBusiness.businessType || 'towing company'),
        businessName: vendorBusiness.businessName,
        ownerName: vendorBusiness.ownerName || user?.fullName || 'Vendor',
        mobileNumber: vendorBusiness.mobileNumber || user?.mobileNumber || '',
        email: vendorBusiness.email || undefined,
        address: address || undefined,
        acceptTerms: true,
      });

      try {
        const session = await refreshAuthSession();
        const { store } = await import('../../../redux/store');
        const { updateTokens, updateUser } = await import('../../../redux/authSlice');
        store.dispatch(
          updateTokens({
            accessToken: session.accessToken,
            refreshToken: session.refreshToken,
          }),
        );
        store.dispatch(updateUser(session.user));
      } catch {
        // Backend role middleware falls back to DB role if refresh fails.
      }

      for (const doc of vendorDocuments) {
        if (!doc.file) continue;
        const documentType = VENDOR_DOC_TYPE_MAP[doc.id] ?? 'other';
        try {
          await uploadVendorDocument(documentType, doc.file, doc.name);
        } catch {
          // Registration saved — document upload can be retried later.
        }
      }

      await completePartnerOnboarding({
        ...(user ?? {
          id: 'vendor',
          mobileNumber: vendorBusiness.mobileNumber || '',
          role: 'vendor',
          isVerified: false,
          isProfileCompleted: true,
        }),
        role: 'vendor',
        fullName: vendorBusiness.ownerName || user?.fullName,
        email: vendorBusiness.email || user?.email,
        isProfileCompleted: true,
      });
      reset();
      navigate('/app/dashboard', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not submit vendor application'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RegistrationLayout
      title="Vendor Registration"
      steps={VENDOR_REGISTRATION_STEPS}
      activeStep={4}
      onBack={() => navigate('/register/vendor/documents')}
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
            After submit, admin approval may be required before your fleet goes live.
          </p>
        </div>
      </div>

      <h3 className="section-title">Business Information</h3>
      <div className="review-card">
        <ReviewRow label="Business Name" value={vendorBusiness.businessName} />
        <ReviewRow label="Owner Name" value={vendorBusiness.ownerName} />
        <ReviewRow label="Mobile" value={vendorBusiness.mobileNumber} />
        <ReviewRow label="Email" value={vendorBusiness.email} />
        <ReviewRow label="Business Type" value={vendorBusiness.businessType} />
      </div>

      <h3 className="section-title">Business Address</h3>
      <div className="review-card">
        <ReviewRow label="Address Line 1" value={vendorAddress.addressLine1} />
        <ReviewRow label="Address Line 2" value={vendorAddress.addressLine2} />
        <ReviewRow label="City" value={vendorAddress.city} />
        <ReviewRow label="State" value={vendorAddress.state} />
        <ReviewRow label="PIN Code" value={vendorAddress.pinCode} />
        <ReviewRow label="Landmark" value={vendorAddress.landmark} />
      </div>

      <h3 className="section-title">Documents ({vendorDocuments.length})</h3>
      <div className="review-card">
        {vendorDocuments.length === 0 ? (
          <p className="muted">No documents uploaded</p>
        ) : (
          vendorDocuments.map((doc) => (
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
