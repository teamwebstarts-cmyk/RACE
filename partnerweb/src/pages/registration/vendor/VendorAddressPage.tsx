import { useNavigate } from 'react-router-dom';

import { RegistrationLayout } from '../../../components/registration/RegistrationLayout';
import { TextField } from '../../../components/ui/TextField';
import {
  INDIAN_STATE_OPTIONS,
  VENDOR_REGISTRATION_STEPS,
} from '../../../constants/registration';
import { usePartnerRegistrationStore } from '../../../store/partnerRegistrationStore';

export function VendorAddressPage() {
  const navigate = useNavigate();
  const vendorAddress = usePartnerRegistrationStore((s) => s.vendorAddress);
  const setVendorAddress = usePartnerRegistrationStore((s) => s.setVendorAddress);

  return (
    <RegistrationLayout
      title="Vendor Registration"
      steps={VENDOR_REGISTRATION_STEPS}
      activeStep={2}
      onBack={() => navigate('/register/vendor/business')}
      onContinue={() => navigate('/register/vendor/documents')}
      continueDisabled={!vendorAddress.addressLine1.trim() || !vendorAddress.city.trim()}
    >
      <p className="muted" style={{ marginBottom: 20 }}>
        Where customers and RACE can find your business.
      </p>
      <TextField
        label="Address line 1"
        value={vendorAddress.addressLine1}
        onChange={(e) => setVendorAddress({ addressLine1: e.target.value })}
      />
      <TextField
        label="Address line 2"
        value={vendorAddress.addressLine2}
        onChange={(e) => setVendorAddress({ addressLine2: e.target.value })}
      />
      <TextField
        label="City"
        value={vendorAddress.city}
        onChange={(e) => setVendorAddress({ city: e.target.value })}
        placeholder="Bhubaneswar"
      />
      <div className="field">
        <label htmlFor="state">State</label>
        <select
          id="state"
          value={vendorAddress.state}
          onChange={(e) => setVendorAddress({ state: e.target.value })}
        >
          <option value="">Select state</option>
          {INDIAN_STATE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
      <TextField
        label="PIN code"
        value={vendorAddress.pinCode}
        onChange={(e) => setVendorAddress({ pinCode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
        inputMode="numeric"
      />
      <TextField
        label="Landmark"
        value={vendorAddress.landmark}
        onChange={(e) => setVendorAddress({ landmark: e.target.value })}
      />
    </RegistrationLayout>
  );
}
