import { useNavigate } from 'react-router-dom';

import { RegistrationLayout } from '../../../components/registration/RegistrationLayout';
import { TextField } from '../../../components/ui/TextField';
import {
  BUSINESS_TYPE_OPTIONS,
  VENDOR_REGISTRATION_STEPS,
} from '../../../constants/registration';
import { useAuthStore } from '../../../store/authStore';
import { usePartnerRegistrationStore } from '../../../store/partnerRegistrationStore';

export function VendorBusinessPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const vendorBusiness = usePartnerRegistrationStore((s) => s.vendorBusiness);
  const setVendorBusiness = usePartnerRegistrationStore((s) => s.setVendorBusiness);

  return (
    <RegistrationLayout
      title="Vendor Registration"
      steps={VENDOR_REGISTRATION_STEPS}
      activeStep={1}
      onContinue={() => {
        if (!vendorBusiness.ownerName.trim()) return;
        if (!vendorBusiness.mobileNumber && user?.mobileNumber) {
          setVendorBusiness({ mobileNumber: user.mobileNumber });
        }
        navigate('/register/vendor/address');
      }}
      continueDisabled={!vendorBusiness.businessName.trim() || !vendorBusiness.ownerName.trim()}
    >
      <p className="muted" style={{ marginBottom: 20 }}>
        Business details for your towing / roadside company.
      </p>
      <TextField
        label="Business name"
        value={vendorBusiness.businessName}
        onChange={(e) => setVendorBusiness({ businessName: e.target.value })}
        placeholder="Company name"
      />
      <TextField
        label="Owner name"
        value={vendorBusiness.ownerName}
        onChange={(e) => setVendorBusiness({ ownerName: e.target.value })}
        placeholder="Owner full name"
      />
      <TextField
        label="Mobile number"
        value={vendorBusiness.mobileNumber || user?.mobileNumber || ''}
        onChange={(e) => setVendorBusiness({ mobileNumber: e.target.value })}
      />
      <TextField
        label="Email (optional)"
        type="email"
        value={vendorBusiness.email}
        onChange={(e) => setVendorBusiness({ email: e.target.value })}
      />
      <div className="field">
        <label htmlFor="businessType">Business type</label>
        <select
          id="businessType"
          value={vendorBusiness.businessType}
          onChange={(e) => setVendorBusiness({ businessType: e.target.value })}
        >
          <option value="">Select type</option>
          {BUSINESS_TYPE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    </RegistrationLayout>
  );
}
