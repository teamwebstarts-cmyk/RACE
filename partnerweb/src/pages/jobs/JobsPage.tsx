import axios from 'axios';
import { Navigation } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
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
import { listVendorBookingOffers } from '../../services/vendorBookingsService';
import { useAuthStore } from '../../store/authStore';
import type { DriverJobBooking } from '../../types/partner';

const ACTIVE_STATUSES = new Set(['DRIVER_EN_ROUTE', 'DRIVER_ARRIVED', 'IN_PROGRESS']);

export function JobsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isDriver = user?.role === 'driver';
  const isVendor = user?.role === 'vendor';
  const [offers, setOffers] = useState<DriverJobBooking[]>([]);
  const [myJobs, setMyJobs] = useState<DriverJobBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingApproval, setPendingApproval] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);

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
        setOffers(await listVendorBookingOffers());
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
              ? 'Nearby customer requests — assign a fleet driver when ready.'
              : 'Nearby customer requests — accept to claim the job (first come, first served).'}
          </p>
        </div>
        <Button variant="outline" onClick={() => void load()} disabled={loading}>
          Refresh
        </Button>
      </div>

      {error ? <div className="toast-error">{error}</div> : null}

      {pendingApproval ? (
        <EmptyState
          title="Waiting for approval"
          description="Your driver account is pending admin approval. Jobs will appear here once approved."
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
              description="When a customer books towing or a driver near you, it shows up here instantly."
            />
          ) : (
            <div className="job-list">
              {offers.map((job) => {
                const busy = actingId === job.id;
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
                    {typeof job.distanceKm === 'number' && job.distanceKm < 900 ? (
                      <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                        ~{job.distanceKm} km away
                      </p>
                    ) : null}
                    {typeof job.estimatedFare === 'number' ? (
                      <p style={{ marginTop: 8, fontWeight: 700 }}>
                        ₹{Math.round(job.estimatedFare).toLocaleString('en-IN')}
                      </p>
                    ) : null}
                    <div className="job-card-actions">
                      {isDriver ? (
                        <Button disabled={busy} onClick={() => void onAccept(job)}>
                          {busy ? 'Accepting…' : 'Accept job'}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => navigate('/app/account/drivers')}
                        >
                          Assign via fleet drivers
                        </Button>
                      )}
                    </div>
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
                          {job.pickup?.address ||
                            job.pickup?.label ||
                            'Pickup location pending'}
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
                            <Button
                              variant="outline"
                              onClick={() => navigate('/app/jobs/active')}
                            >
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
