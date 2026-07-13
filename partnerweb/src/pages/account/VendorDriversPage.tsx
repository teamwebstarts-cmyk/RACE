import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { TextField } from '../../components/ui/TextField';
import { getApiErrorMessage } from '../../services/api';
import {
  createVendorDriver,
  listVendorDrivers,
  removeVendorDriver,
} from '../../services/vendorDriversService';
import type { CreateFleetDriverInput, FleetDriver } from '../../types/partner';

const emptyForm: CreateFleetDriverInput = {
  name: '',
  phone: '',
  licenseNo: '',
  driverType: 'Tow Driver',
  city: 'Bhubaneswar',
  vehicleRegistration: '',
  email: '',
};

export function VendorDriversPage() {
  const [drivers, setDrivers] = useState<FleetDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateFleetDriverInput>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setDrivers(await listVendorDrivers());
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load drivers'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await createVendorDriver({
        ...form,
        email: form.email || undefined,
        vehicleRegistration: form.vehicleRegistration || undefined,
      });
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not add driver'));
    } finally {
      setSubmitting(false);
    }
  };

  const onRemove = async (id: string) => {
    if (!window.confirm('Remove this driver from your fleet?')) return;
    try {
      await removeVendorDriver(id);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not remove driver'));
    }
  };

  return (
    <div className="page-section">
      <ScreenHeader
        title="Fleet drivers"
        right={
          <Button variant="outline" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cancel' : 'Add driver'}
          </Button>
        }
      />
      {error ? <div className="toast-error">{error}</div> : null}

      {showForm ? (
        <form className="driver-form" onSubmit={onCreate}>
          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <TextField
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            required
          />
          <TextField
            label="Licence number"
            value={form.licenseNo}
            onChange={(e) => setForm((f) => ({ ...f, licenseNo: e.target.value }))}
            required
          />
          <div className="field">
            <label htmlFor="driverType">Driver type</label>
            <select
              id="driverType"
              value={form.driverType}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  driverType: e.target.value as CreateFleetDriverInput['driverType'],
                }))
              }
            >
              <option value="Tow Driver">Tow Driver</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
            </select>
          </div>
          <TextField
            label="Vehicle registration"
            value={form.vehicleRegistration || ''}
            onChange={(e) => setForm((f) => ({ ...f, vehicleRegistration: e.target.value }))}
          />
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save driver'}
          </Button>
        </form>
      ) : null}

      {loading ? (
        <div className="loading-inline">
          <div className="spinner" />
        </div>
      ) : drivers.length === 0 ? (
        <EmptyState
          title="No drivers yet"
          description="Add fleet drivers so they can receive allotted jobs."
        />
      ) : (
        <div className="job-list" style={{ marginTop: 20 }}>
          {drivers.map((driver) => (
            <article key={driver.id} className="job-card">
              <div className="job-card-head">
                <strong>{driver.name}</strong>
                <span className="type-pill">{driver.driverType}</span>
              </div>
              <p className="muted" style={{ marginTop: 6 }}>
                {driver.phone}
                {driver.isBusy ? ' · Busy' : driver.isAvailable ? ' · Online-ready' : ' · Offline'}
              </p>
              <p className="muted" style={{ fontSize: 13 }}>
                Licence {driver.licenseNo}
                {driver.vehicleRegistration ? ` · ${driver.vehicleRegistration}` : ''}
              </p>
              <div className="job-card-actions">
                <Button variant="danger" onClick={() => void onRemove(driver.id)}>
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
