import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { TextField } from '../../components/ui/TextField';
import {
  INSURANCE_PROVIDER_OPTIONS,
  VEHICLE_TYPE_OPTIONS,
} from '../../constants/registration';
import { getApiErrorMessage } from '../../services/api';
import {
  createVendorVehicle,
  listVendorVehicles,
  removeVendorVehicle,
} from '../../services/vendorVehiclesService';
import type { CreateFleetVehicleInput, FleetVehicle } from '../../types/partner';

const emptyForm: CreateFleetVehicleInput = {
  registrationNo: '',
  type: '',
  model: '',
  year: undefined,
  insuranceExpiry: '',
  insuranceProvider: '',
  insurancePolicyNumber: '',
  rcNumber: '',
};

export function VendorVehiclesPage() {
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateFleetVehicleInput>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setVehicles(await listVendorVehicles());
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load vehicles'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.registrationNo.trim() || !form.type || !form.model.trim()) {
      setError('Registration number, type, and model are required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await createVendorVehicle({
        registrationNo: form.registrationNo.trim().toUpperCase(),
        type: form.type,
        model: form.model.trim(),
        year: form.year || undefined,
        insuranceExpiry: form.insuranceExpiry || undefined,
        insuranceProvider: form.insuranceProvider || undefined,
        insurancePolicyNumber: form.insurancePolicyNumber || undefined,
        rcNumber: form.rcNumber || undefined,
      });
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not register vehicle'));
    } finally {
      setSubmitting(false);
    }
  };

  const onRemove = async (id: string) => {
    if (!window.confirm('Remove this vehicle from your fleet?')) return;
    try {
      await removeVendorVehicle(id);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not remove vehicle'));
    }
  };

  return (
    <div className="page-section">
      <ScreenHeader
        title="Fleet vehicles"
        right={
          <Button variant="outline" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cancel' : 'Register vehicle'}
          </Button>
        }
      />
      <p className="muted" style={{ marginTop: -8, marginBottom: 16 }}>
        Register tow trucks and vans now — you can assign them with drivers later.
      </p>
      {error ? <div className="toast-error">{error}</div> : null}

      {showForm ? (
        <form className="driver-form" onSubmit={onCreate}>
          <div className="field">
            <label htmlFor="vehicleType">Vehicle type</label>
            <select
              id="vehicleType"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              required
            >
              <option value="">Select type</option>
              {VEHICLE_TYPE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <TextField
            label="Vehicle registration"
            value={form.registrationNo}
            onChange={(e) =>
              setForm((f) => ({ ...f, registrationNo: e.target.value.toUpperCase() }))
            }
            placeholder="OD 02 AB 1234"
            required
          />
          <TextField
            label="Vehicle model"
            value={form.model}
            onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
            placeholder="Model"
            required
          />
          <TextField
            label="Licence / RC number"
            value={form.rcNumber || ''}
            onChange={(e) => setForm((f) => ({ ...f, rcNumber: e.target.value }))}
            placeholder="RC number"
          />
          <TextField
            label="Year"
            type="number"
            value={form.year?.toString() ?? ''}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                year: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
            placeholder="2022"
          />
          <div className="field">
            <label htmlFor="insuranceProvider">Insurance provider</label>
            <select
              id="insuranceProvider"
              value={form.insuranceProvider || ''}
              onChange={(e) => setForm((f) => ({ ...f, insuranceProvider: e.target.value }))}
            >
              <option value="">Select provider</option>
              {INSURANCE_PROVIDER_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <TextField
            label="Policy number"
            value={form.insurancePolicyNumber || ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, insurancePolicyNumber: e.target.value }))
            }
            placeholder="Policy number"
          />
          <TextField
            label="Insurance expiry"
            type="date"
            value={form.insuranceExpiry || ''}
            onChange={(e) => setForm((f) => ({ ...f, insuranceExpiry: e.target.value }))}
          />
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save vehicle'}
          </Button>
        </form>
      ) : null}

      {loading ? (
        <div className="loading-inline">
          <div className="spinner" />
        </div>
      ) : vehicles.length === 0 ? (
        <EmptyState
          title="No vehicles yet"
          description="Register fleet vehicles so you can assign them with drivers on jobs."
        />
      ) : (
        <div className="job-list" style={{ marginTop: 20 }}>
          {vehicles.map((vehicle) => (
            <article key={vehicle.id} className="job-card">
              <div className="job-card-head">
                <strong>{vehicle.registrationNo}</strong>
                <span className="type-pill">{vehicle.status.replace(/_/g, ' ')}</span>
              </div>
              <p className="muted" style={{ marginTop: 6 }}>
                {vehicle.type}
                {vehicle.year ? ` · ${vehicle.year}` : ''}
              </p>
              <p className="muted" style={{ fontSize: 13 }}>
                Model {vehicle.model}
                {vehicle.maintenanceNote ? ` · ${vehicle.maintenanceNote}` : ''}
              </p>
              {vehicle.insuranceExpiry ? (
                <p className="muted" style={{ fontSize: 13 }}>
                  Insurance till{' '}
                  {new Date(vehicle.insuranceExpiry).toLocaleDateString('en-IN')}
                </p>
              ) : null}
              <div className="job-card-actions">
                <Button variant="danger" onClick={() => void onRemove(vehicle.id)}>
                  Remove
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
