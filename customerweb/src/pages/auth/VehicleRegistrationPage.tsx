import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { OnboardingLayout } from '../../components/auth/OnboardingLayout';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { getApiErrorMessage } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useVehicleStore } from '../../store/vehicleStore';
import type { FuelType, VehicleType } from '../../types/models';

export function VehicleRegistrationPage() {
  const navigate = useNavigate();
  const addVehicle = useVehicleStore((s) => s.addVehicle);
  const vehicles = useVehicleStore((s) => s.vehicles);
  const advanceOnboarding = useAuthStore((s) => s.advanceOnboarding);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState('');
  const [form, setForm] = useState({
    vehicleType: 'car' as VehicleType,
    vehicleNumber: '',
    brand: '',
    model: '',
    color: '',
    fuelType: 'petrol' as FuelType,
  });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const vehicle = await addVehicle({
        vehicleType: form.vehicleType,
        vehicleNumber: form.vehicleNumber.trim().toUpperCase(),
        brand: form.brand.trim(),
        model: form.model.trim(),
        color: form.color.trim() || undefined,
        fuelType: form.fuelType,
      });
      navigate(`/onboarding/qr?vehicleId=${vehicle.id}`, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to add vehicle'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <OnboardingLayout
      step="vehicle"
      title={vehicles.length ? 'Add another vehicle' : 'Register your vehicle'}
      subtitle="Customers can add multiple vehicles. Each one gets an emergency QR with your contact details."
    >
      {vehicles.length > 0 ? (
        <div className="toast-success">
          {vehicles.length} vehicle{vehicles.length > 1 ? 's' : ''} already saved. Add more or
          finish from the QR screen.
        </div>
      ) : null}
      {error ? <div className="toast-error">{error}</div> : null}
      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="vehicleType">Vehicle type</label>
          <select
            id="vehicleType"
            value={form.vehicleType}
            onChange={(e) =>
              setForm((p) => ({ ...p, vehicleType: e.target.value as VehicleType }))
            }
          >
            <option value="car">Car</option>
            <option value="bike">Bike</option>
            <option value="ev">EV</option>
            <option value="truck">Truck</option>
            <option value="auto">Auto</option>
            <option value="bus">Bus</option>
            <option value="other">Other</option>
          </select>
        </div>
        <TextField
          label="Vehicle number"
          value={form.vehicleNumber}
          onChange={(e) => setForm((p) => ({ ...p, vehicleNumber: e.target.value }))}
          placeholder="OD02AB1234"
          required
        />
        <div className="grid-2">
          <TextField
            label="Vehicle brand"
            value={form.brand}
            onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))}
            required
          />
          <TextField
            label="Vehicle model"
            value={form.model}
            onChange={(e) => setForm((p) => ({ ...p, model: e.target.value }))}
            required
          />
        </div>
        <div className="grid-2">
          <TextField
            label="Vehicle color"
            value={form.color}
            onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
            placeholder="White"
          />
          <div className="field">
            <label htmlFor="fuelType">Fuel type</label>
            <select
              id="fuelType"
              value={form.fuelType}
              onChange={(e) =>
                setForm((p) => ({ ...p, fuelType: e.target.value as FuelType }))
              }
            >
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="cng">CNG</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label>
            Vehicle photo <span className="optional-tag">Optional</span>
          </label>
          <div className="photo-upload">
            {photoPreview ? (
              <img src={photoPreview} alt="Vehicle preview" />
            ) : (
              <div className="avatar" style={{ borderRadius: 16 }}>
                V
              </div>
            )}
            <div className="photo-upload-meta">
              <p className="muted" style={{ fontSize: 13, marginBottom: 8 }}>
                Local preview for now. Cloud photo upload will attach once media storage is wired.
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setPhotoPreview(URL.createObjectURL(file));
                }}
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <Button block type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save & generate QR'}
          </Button>
          {vehicles.length > 0 ? (
            <Button
              variant="ghost"
              block
              type="button"
              onClick={() => {
                advanceOnboarding('done');
                navigate('/app/home', { replace: true });
              }}
            >
              Finish without adding more
            </Button>
          ) : null}
        </div>
      </form>
    </OnboardingLayout>
  );
}
