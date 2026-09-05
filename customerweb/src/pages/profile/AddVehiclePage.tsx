import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { PageShell } from '../../components/layout/PageShell';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { TextField } from '../../components/ui/TextField';
import { getApiErrorMessage } from '../../services/api';
import { useVehicleStore } from '../../store/vehicleStore';
import type { FuelType, VehicleType } from '../../types/models';

export function AddVehiclePage() {
  const navigate = useNavigate();
  const addVehicle = useVehicleStore((s) => s.addVehicle);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
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
        ...form,
        vehicleNumber: form.vehicleNumber.trim().toUpperCase(),
      });
      navigate(`/app/profile/vehicles/${vehicle.id}`, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to add vehicle'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell narrow>
      <ScreenHeader title="Add vehicle" />
      {error ? <div className="toast-error">{error}</div> : null}
      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="type">Type</label>
          <select
            id="type"
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
            <option value="other">Other</option>
          </select>
        </div>
        <TextField
          label="Registration number"
          value={form.vehicleNumber}
          onChange={(e) => setForm((p) => ({ ...p, vehicleNumber: e.target.value }))}
          required
        />
        <TextField
          label="Brand"
          value={form.brand}
          onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))}
          required
        />
        <TextField
          label="Model"
          value={form.model}
          onChange={(e) => setForm((p) => ({ ...p, model: e.target.value }))}
          required
        />
        <TextField
          label="Color"
          value={form.color}
          onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
        />
        <div className="field">
          <label htmlFor="fuel">Fuel</label>
          <select
            id="fuel"
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
        <div className="form-actions">
          <Button block type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save vehicle'}
          </Button>
        </div>
      </form>
    </PageShell>
  );
}
