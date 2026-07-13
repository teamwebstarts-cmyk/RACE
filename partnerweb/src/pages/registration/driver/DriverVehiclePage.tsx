import { useNavigate } from 'react-router-dom';

import { RegistrationLayout } from '../../../components/registration/RegistrationLayout';
import {
  DRIVER_REGISTRATION_STEPS,
  INSURANCE_PROVIDER_OPTIONS,
  VEHICLE_TYPE_OPTIONS,
} from '../../../constants/registration';
import { usePartnerRegistrationStore } from '../../../store/partnerRegistrationStore';

export function DriverVehiclePage() {
  const navigate = useNavigate();
  const driverVehicle = usePartnerRegistrationStore((s) => s.driverVehicle);
  const setDriverVehicle = usePartnerRegistrationStore((s) => s.setDriverVehicle);

  return (
    <RegistrationLayout
      title="Driver Registration"
      steps={DRIVER_REGISTRATION_STEPS}
      activeStep={2}
      onBack={() => navigate('/register/driver/personal')}
      onContinue={() => navigate('/register/driver/documents')}
      continueDisabled={!driverVehicle.vehicleType || !driverVehicle.vehicleNumber}
    >
      <p className="muted" style={{ marginBottom: 20 }}>
        Vehicle and licence details used for allotment.
      </p>
      <div className="field">
        <label htmlFor="vehicleType">Vehicle type</label>
        <select
          id="vehicleType"
          value={driverVehicle.vehicleType}
          onChange={(e) => setDriverVehicle({ vehicleType: e.target.value })}
        >
          <option value="">Select type</option>
          {VEHICLE_TYPE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="vehicleNumber">Vehicle registration</label>
        <input
          id="vehicleNumber"
          value={driverVehicle.vehicleNumber}
          onChange={(e) => setDriverVehicle({ vehicleNumber: e.target.value.toUpperCase() })}
          placeholder="OD 02 AB 1234"
        />
      </div>
      <div className="field">
        <label htmlFor="rcNumber">Licence / RC number</label>
        <input
          id="rcNumber"
          value={driverVehicle.rcNumber}
          onChange={(e) => setDriverVehicle({ rcNumber: e.target.value })}
          placeholder="Licence or RC number"
        />
      </div>
      <div className="field">
        <label htmlFor="vehicleModel">Vehicle model</label>
        <input
          id="vehicleModel"
          value={driverVehicle.vehicleModel}
          onChange={(e) => setDriverVehicle({ vehicleModel: e.target.value })}
          placeholder="Model"
        />
      </div>
      <div className="field">
        <label htmlFor="insuranceProvider">Insurance provider</label>
        <select
          id="insuranceProvider"
          value={driverVehicle.insuranceProvider}
          onChange={(e) => setDriverVehicle({ insuranceProvider: e.target.value })}
        >
          <option value="">Select provider</option>
          {INSURANCE_PROVIDER_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="policy">Policy number</label>
        <input
          id="policy"
          value={driverVehicle.insurancePolicyNumber}
          onChange={(e) => setDriverVehicle({ insurancePolicyNumber: e.target.value })}
          placeholder="Policy number"
        />
      </div>
    </RegistrationLayout>
  );
}
