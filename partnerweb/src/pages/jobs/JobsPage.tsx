import axios from 'axios';
import { Navigation } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { getApiErrorMessage } from '../../services/api';
import {
  acceptDriverJob,
  listDriverJobOffers,
  listDriverJobs,
  rejectDriverJob,
} from '../../services/driverService';
import { listVendorDrivers } from '../../services/vendorDriversService';
import { listVendorVehicles } from '../../services/vendorVehiclesService';
import {
  assignVendorBooking,
  listVendorBookingOffers,
} from '../../services/vendorBookingsService';
import { useAuthStore } from '../../store/authStore';
import type { DriverJobBooking, FleetDriver, FleetVehicle } from '../../types/partner';

const ACTIVE_STATUSES = new Set(['DRIVER_EN_ROUTE', 'DRIVER_ARRIVED', 'IN_PROGRESS']);

function eligibleDrivers(drivers: FleetDriver[], bookingType: 'towing' | 'driver') {
  return drivers.filter((d) => {
    if (d.isBusy) return false;
    const type = d.driverType.toLowerCase();
    if (bookingType === 'towing') {
      return type.includes('tow');
    }
    return type.includes('full') || type.includes('part');
  });
}

export function JobsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isDriver = user?.role === 'driver';
  const isVendor = user?.role === 'vendor';
  const [offers, setOffers] = useState<DriverJobBooking[]>([]);
  const [myJobs, setMyJobs] = useState<DriverJobBooking[]>([]);
  const [fleetDrivers, setFleetDrivers] = useState<FleetDriver[]>([]);
  const [fleetVehicles, setFleetVehicles] = useState<FleetVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pendingApproval, setPendingApproval] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');

  const load = useCallback(async () => {
    if (!isDriver && !isVendor) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    setPendingApproval(false);
    try {
      if (isDriver) {
        const [open, mine] = await Promise.all([
          listDriverJobOffers(),
          listDriverJobs(),
        ]);
        setOffers(open);
        setMyJobs(mine);
      } else {
        const [open, drivers, vehicles] = await Promise.all([
          listVendorBookingOffers(),
          listVendorDrivers().catch(() => [] as FleetDriver[]),
          listVendorVehicles().catch(() => [] as FleetVehicle[]),
        ]);
        setOffers(open);
        setFleetDrivers(drivers);
        setFleetVehicles(vehicles.filter((v) => v.status === 'ACTIVE'));
        setMyJobs([]);
      }
    } catch (err) {
      if (
        axios.isAxiosError(err) &&
        err.response?.status === 403 &&
        String((err.response?.data as { message?: string } | undefined)?.message || '')
          .toLowerCase()
          .includes('pending admin approval')
      ) {
        setPendingApproval(true);
      } else {
        setError(getApiErrorMessage(err, 'Unable to load jobs'));
      }
    } finally {
      setLoading(false);
    }
  }, [isDriver, isVendor]);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 8000);
    return () => window.clearInterval(timer);
  }, [load]);

  const assigningOffer = useMemo(
    () => offers.find((o) => o.id === assigningId) ?? null,
    [offers, assigningId],
  );

  const driversForAssign = useMemo(() => {
    if (!assigningOffer) return [];
    return eligibleDrivers(fleetDrivers, assigningOffer.bookingType);
  }, [assigningOffer, fleetDrivers]);

  useEffect(() => {
    if (!assigningOffer) return;
    const eligible = eligibleDrivers(fleetDrivers, assigningOffer.bookingType);
    setSelectedDriverId((prev) =>
      eligible.some((d) => d.id === prev) ? prev : eligible[0]?.id || '',
    );
    setSelectedVehicleId((prev) =>
      fleetVehicles.some((v) => v.id === prev) ? prev : fleetVehicles[0]?.id || '',
    );
  }, [assigningOffer, fleetDrivers, fleetVehicles]);

  const onAccept = async (job: DriverJobBooking) => {
    if (!isDriver) return;
    setActingId(job.id);
    try {
      await acceptDriverJob(job.id, job.bookingType);
      navigate('/app/jobs/active');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not accept job'));
      await load();
    } finally {
      setActingId(null);
    }
  };

  const onReject = async (job: DriverJobBooking) => {
    if (!window.confirm('Reject this job? It will go back to the open pool.')) return;
    setActingId(job.id);
    try {
      await rejectDriverJob(job.id, job.bookingType);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not reject job'));
    } finally {
      setActingId(null);
    }
  };

  const onVendorAssign = async () => {
    if (!assigningOffer || !selectedDriverId) {
      setError('Select a driver for this service');
      return;
    }
    setActingId(assigningOffer.id);
    setError('');
    setSuccess('');
    try {
      const result = await assignVendorBooking({
        bookingId: assigningOffer.id,
        bookingType: assigningOffer.bookingType,
        driverId: selectedDriverId,
        vehicleId: selectedVehicleId || undefined,
      });
      setSuccess(
        result.message ||
          `Assigned ${result.driver?.name || 'driver'} — customer can see details now.`,
      );
      setAssigningId(null);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not assign driver'));
    } finally {
      setActingId(null);
    }
  };

  if (!isDriver && !isVendor) {
    return (
      <div className="page-section">
        <h1>Jobs</h1>
        <EmptyState
          title="Partner jobs"
          description="Sign in as a vendor or driver to see nearby customer requests."
        />
      </div>
    );
  }

  return (
    <div className="page-section">
      <div className="page-hero-row">
        <div>
          <h1>Jobs</h1>
          <p className="muted">
            {isVendor
              ? 'Select a driver and vehicle for each customer request — they will see the details instantly.'
              : 'Nearby customer requests — accept to claim the job (first come, first served).'}
          </p>
        </div>
        <Button variant="outline" onClick={() => void load()} disabled={loading}>
          Refresh
        </Button>
      </div>

      {error ? <div className="toast-error">{error}</div> : null}
      {success ? <div className="toast-success">{success}</div> : null}

      {pendingApproval ? (
        <EmptyState
          title="Waiting for approval"
          description="Your account is pending admin approval. Jobs will appear here once approved."
        />
      ) : loading && offers.length === 0 && myJobs.length === 0 ? (
        <div className="loading-inline">
          <div className="spinner" />
        </div>
      ) : (
        <>
          <h2 style={{ fontSize: 18, marginTop: 8, marginBottom: 12 }}>Nearby requests</h2>
          {offers.length === 0 ? (
            <EmptyState
              title="No open requests nearby"
              description="When a customer books towing or a driver near you, it shows up here."
            />
          ) : (
            <div className="job-list">
              {offers.map((job) => {
                const busy = actingId === job.id;
                const isAssigning = assigningId === job.id;
                return (
                  <article key={`offer-${job.bookingType}-${job.id}`} className="job-card">
                    <div className="job-card-head">
                      <strong>#{job.bookingNumber}</strong>
                      <span className="type-pill">
                        {job.serviceLabel ||
                          (job.bookingType === 'towing' ? 'Towing' : 'Driver')}
                      </span>
                    </div>
                    <p className="job-status">Open · waiting for partner</p>
                    <p className="muted" style={{ marginTop: 8 }}>
                      {job.pickup?.address || job.pickup?.label || 'Pickup location pending'}
                    </p>
                    {typeof job.estimatedFare === 'number' ? (
                      <p style={{ marginTop: 8, fontWeight: 700 }}>
                        ₹{Math.round(job.estimatedFare).toLocaleString('en-IN')}
                      </p>
                    ) : null}

                    {isVendor && isAssigning ? (
                      <div className="driver-form" style={{ marginTop: 16 }}>
                        <p className="muted" style={{ marginBottom: 12, fontSize: 13 }}>
                          {job.bookingType === 'towing'
                            ? 'Choose a Tow Driver and fleet vehicle for this towing request.'
                            : 'Choose a Full-Time / Part-Time driver (and vehicle if needed).'}
                        </p>
                        <div className="field">
                          <label htmlFor={`driver-${job.id}`}>Driver</label>
                          <select
                            id={`driver-${job.id}`}
                            value={selectedDriverId}
                            onChange={(e) => setSelectedDriverId(e.target.value)}
                          >
                            <option value="">Select driver</option>
                            {driversForAssign.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name} · {d.driverType}
                                {!d.isAvailable ? ' (offline)' : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                        {driversForAssign.length === 0 ? (
                          <p className="field-error" style={{ marginBottom: 12 }}>
                            No eligible drivers in your fleet for this service.{' '}
                            <button
                              type="button"
                              className="btn btn-ghost"
                              style={{ minHeight: 0, padding: 0 }}
                              onClick={() => navigate('/app/account/drivers')}
                            >
                              Add drivers
                            </button>
                          </p>
                        ) : null}
                        <div className="field">
                          <label htmlFor={`vehicle-${job.id}`}>Fleet vehicle</label>
                          <select
                            id={`vehicle-${job.id}`}
                            value={selectedVehicleId}
                            onChange={(e) => setSelectedVehicleId(e.target.value)}
                          >
                            <option value="">No vehicle / optional</option>
                            {fleetVehicles.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.registrationNo} · {v.type} · {v.model}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="job-card-actions">
                          <Button disabled={busy || !selectedDriverId} onClick={() => void onVendorAssign()}>
                            {busy ? 'Assigning…' : 'Assign & notify customer'}
                          </Button>
                          <Button variant="outline" disabled={busy} onClick={() => setAssigningId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="job-card-actions">
                        {isDriver ? (
                          <Button disabled={busy} onClick={() => void onAccept(job)}>
                            {busy ? 'Accepting…' : 'Accept job'}
                          </Button>
                        ) : (
                          <Button
                            onClick={() => {
                              setSuccess('');
                              setError('');
                              setAssigningId(job.id);
                            }}
                          >
                            Select driver & vehicle
                          </Button>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {isDriver ? (
            <>
              <h2 style={{ fontSize: 18, marginTop: 32, marginBottom: 12 }}>My jobs</h2>
              {myJobs.length === 0 ? (
                <p className="muted">No assigned jobs yet.</p>
              ) : (
                <div className="job-list">
                  {myJobs.map((job) => {
                    const canDecide = job.status === 'DRIVER_ASSIGNED';
                    const isActive = ACTIVE_STATUSES.has(job.status);
                    const busy = actingId === job.id;
                    return (
                      <article key={`mine-${job.bookingType}-${job.id}`} className="job-card">
                        <div className="job-card-head">
                          <strong>#{job.bookingNumber}</strong>
                          <span className="type-pill">
                            {job.bookingType === 'towing' ? 'Towing' : 'Driver'}
                          </span>
                        </div>
                        <p className="job-status">{job.status.replace(/_/g, ' ')}</p>
                        <p className="muted" style={{ marginTop: 8 }}>
                          {job.pickup?.address || job.pickup?.label || 'Pickup location pending'}
                        </p>
                        <div className="job-card-actions">
                          {canDecide ? (
                            <>
                              <Button disabled={busy} onClick={() => void onAccept(job)}>
                                {busy ? 'Working…' : 'Accept'}
                              </Button>
                              <Button
                                variant="outline"
                                disabled={busy}
                                onClick={() => void onReject(job)}
                              >
                                Reject
                              </Button>
                            </>
                          ) : null}
                          {isActive ? (
                            <Button variant="outline" onClick={() => navigate('/app/jobs/active')}>
                              <Navigation size={16} style={{ marginRight: 6 }} />
                              Open active
                            </Button>
                          ) : null}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          ) : null}
        </>
      )}
    </div>
  );
}
