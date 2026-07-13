import { MapPin, Navigation } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { getApiErrorMessage } from '../../services/api';
import {
  getDriverActiveJob,
  updateDriverBookingStatus,
} from '../../services/driverService';
import type { DriverJobBooking } from '../../types/partner';

type JobStatus =
  | 'DRIVER_ASSIGNED'
  | 'DRIVER_EN_ROUTE'
  | 'DRIVER_ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED';

const STATUS_ACTIONS: Partial<
  Record<JobStatus, { next: JobStatus; label: string }>
> = {
  DRIVER_EN_ROUTE: { next: 'DRIVER_ARRIVED', label: 'Arrived at pickup' },
  DRIVER_ARRIVED: { next: 'IN_PROGRESS', label: 'Start trip' },
  IN_PROGRESS: { next: 'COMPLETED', label: 'Complete job' },
};

const STATUS_LABELS: Record<string, string> = {
  DRIVER_ASSIGNED: 'Assigned — accept from jobs list',
  DRIVER_EN_ROUTE: 'En route to pickup',
  DRIVER_ARRIVED: 'Arrived at pickup',
  IN_PROGRESS: 'Trip in progress',
  COMPLETED: 'Completed',
};

export function ActiveJobPage() {
  const navigate = useNavigate();
  const [job, setJob] = useState<DriverJobBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const active = await getDriverActiveJob();
      setJob(active);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load active job'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const action = useMemo(() => {
    if (!job) return null;
    return STATUS_ACTIONS[job.status as JobStatus] ?? null;
  }, [job]);

  const onStatusUpdate = async (nextStatus: JobStatus) => {
    if (!job) return;
    setActing(true);
    setError('');
    try {
      await updateDriverBookingStatus(job.id, job.bookingType, nextStatus);
      await load();
      if (nextStatus === 'COMPLETED') {
        window.alert('Job completed. You are available for new bookings.');
        navigate('/app/jobs');
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not update job status'));
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <div className="page-section">
        <div className="loading-inline">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="page-section">
        <h1>Active job</h1>
        <EmptyState
          title="No active job"
          description="Accept a booking from the Jobs page."
          action={
            <Button onClick={() => navigate('/app/jobs')}>
              <Navigation size={16} style={{ marginRight: 6 }} />
              Back to jobs
            </Button>
          }
        />
      </div>
    );
  }

  const pickup = job.pickup?.address || job.pickup?.label || 'Pickup pending';
  const dropoff = job.dropoff?.address || job.dropoff?.label;

  return (
    <div className="page-section">
      <h1>Active job</h1>
      <p className="muted">#{job.bookingNumber}</p>
      {error ? <div className="toast-error">{error}</div> : null}

      <article className="job-card" style={{ marginTop: 20 }}>
        <div className="job-card-head">
          <strong>{STATUS_LABELS[job.status] || job.status.replace(/_/g, ' ')}</strong>
          <span className="type-pill">
            {job.bookingType === 'towing' ? 'Towing' : 'Driver'}
          </span>
        </div>
        <div className="active-job-row">
          <MapPin size={18} color="#F5A800" />
          <div>
            <span className="muted" style={{ fontSize: 12 }}>
              Pickup
            </span>
            <p>{pickup}</p>
          </div>
        </div>
        {dropoff ? (
          <div className="active-job-row">
            <Navigation size={18} color="#F5A800" />
            <div>
              <span className="muted" style={{ fontSize: 12 }}>
                Dropoff
              </span>
              <p>{dropoff}</p>
            </div>
          </div>
        ) : null}
        {typeof job.estimatedFare === 'number' ? (
          <p style={{ marginTop: 12, fontWeight: 700 }}>
            Est. ₹{Math.round(job.estimatedFare).toLocaleString('en-IN')}
          </p>
        ) : null}
        <div className="job-card-actions">
          {action ? (
            <Button disabled={acting} onClick={() => void onStatusUpdate(action.next)}>
              {acting ? 'Updating…' : action.label}
            </Button>
          ) : null}
          <Button variant="outline" onClick={() => navigate('/app/jobs')}>
            All jobs
          </Button>
        </div>
      </article>
    </div>
  );
}
