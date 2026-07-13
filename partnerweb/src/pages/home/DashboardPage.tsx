import { Briefcase, RefreshCw, ShieldCheck, Wallet } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../components/ui/Button';
import { getApiErrorMessage } from '../../services/api';
import {
  getDriverActiveJob,
  listDriverJobs,
  setDriverAvailability,
} from '../../services/driverService';
import { getVendorDashboard, getVendorStatus } from '../../services/vendorService';
import { useAuthStore } from '../../store/authStore';
import { useProfileStore } from '../../store/profileStore';
import type { DriverJobBooking } from '../../types/partner';
import type { VendorDashboardStats, VendorProfileResponse } from '../../types/vendor';

export function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);
  const isDriver = user?.role === 'driver';
  const isVendor = user?.role === 'vendor';
  const name = profile?.fullName || user?.fullName || 'Partner';

  const [isOnline, setIsOnline] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [jobs, setJobs] = useState<DriverJobBooking[]>([]);
  const [activeJob, setActiveJob] = useState<DriverJobBooking | null>(null);
  const [vendor, setVendor] = useState<VendorProfileResponse | null>(null);
  const [vendorDashboard, setVendorDashboard] = useState<VendorDashboardStats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      if (isDriver) {
        const [jobList, active] = await Promise.all([
          listDriverJobs(),
          getDriverActiveJob(),
        ]);
        try {
          await useProfileStore.getState().fetchProfile();
        } catch {
          // Keep dashboard usable if profile refresh fails.
        }
        setJobs(jobList);
        setActiveJob(active);
        const profileData = useProfileStore.getState().profile;
        if (typeof profileData?.isAvailable === 'boolean') {
          setIsOnline(profileData.isAvailable);
        }
      }
      if (isVendor) {
        const [status, dashboard] = await Promise.all([
          getVendorStatus(),
          getVendorDashboard().catch(() => null),
        ]);
        setVendor(status);
        setVendorDashboard(dashboard);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load dashboard'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [isDriver, isVendor]);

  const todayJobs = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return jobs.filter((job) => new Date(job.createdAt) >= start);
  }, [jobs]);

  const earningsToday = useMemo(() => {
    if (isVendor) return vendorDashboard?.earningsToday ?? 0;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return jobs
      .filter(
        (job) =>
          new Date(job.createdAt) >= start &&
          job.status === 'COMPLETED' &&
          typeof job.estimatedFare === 'number',
      )
      .reduce((sum, job) => sum + (job.estimatedFare ?? 0), 0);
  }, [isVendor, jobs, vendorDashboard?.earningsToday]);

  const jobsTodayCount = isVendor ? (vendorDashboard?.jobsToday ?? 0) : todayJobs.length;

  const toggleAvailability = async () => {
    if (!isDriver) return;
    setToggling(true);
    try {
      const result = await setDriverAvailability(!isOnline);
      setIsOnline(result.isAvailable);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not update availability'));
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="page-section">
      <div className="page-hero-row">
        <div>
          <p className="muted" style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
            {isDriver ? 'Driver' : isVendor ? 'Vendor' : 'Partner'}
          </p>
          <h1 style={{ marginBottom: 8 }}>Hello, {name.split(' ')[0]}</h1>
          <p className="muted">
            {isDriver
              ? isOnline
                ? 'You are online and ready for allotments.'
                : 'You are offline — turn on availability to receive jobs.'
              : vendor
                ? `Status: ${vendor.status.replace(/_/g, ' ')}`
                : 'Manage your fleet and verification from Account.'}
          </p>
        </div>
        <Button variant="outline" onClick={() => void load()} disabled={loading}>
          <RefreshCw size={16} style={{ marginRight: 8 }} />
          Refresh
        </Button>
      </div>

      {error ? <div className="toast-error">{error}</div> : null}

      {isDriver ? (
        <div className="availability-toggle">
          <div>
            <strong>{isOnline ? 'Online' : 'Offline'}</strong>
            <p className="muted" style={{ marginTop: 4, fontSize: 13 }}>
              Toggle to start or stop receiving new jobs.
            </p>
          </div>
          <button
            type="button"
            className={`toggle-switch ${isOnline ? 'on' : ''}`}
            aria-pressed={isOnline}
            disabled={toggling}
            onClick={() => void toggleAvailability()}
          >
            <span className="toggle-knob" />
          </button>
        </div>
      ) : null}

      {isVendor && vendor ? (
        <div className="status-card">
          <ShieldCheck size={22} color="#F5A800" />
          <div>
            <strong>{vendor.status.replace(/_/g, ' ')}</strong>
            <p className="muted" style={{ marginTop: 4, fontSize: 13 }}>
              Stage: {vendor.verificationStage.replace(/_/g, ' ')}
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/app/account/verification')}>
            Details
          </Button>
        </div>
      ) : null}

      <div className="stat-grid">
        <div className="stat-card">
          <Briefcase size={20} color="#F5A800" />
          <div>
            <span className="stat-value">{jobsTodayCount}</span>
            <span className="muted">Jobs today</span>
          </div>
        </div>
        <div className="stat-card">
          <Wallet size={20} color="#F5A800" />
          <div>
            <span className="stat-value">₹{Math.round(earningsToday).toLocaleString('en-IN')}</span>
            <span className="muted">Earnings today</span>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        {isDriver ? (
          <>
            <Button onClick={() => navigate('/app/jobs')}>View jobs</Button>
            {activeJob ? (
              <Button variant="outline" onClick={() => navigate('/app/jobs/active')}>
                Active job
              </Button>
            ) : null}
          </>
        ) : null}
        {isVendor ? (
          <>
            <Button onClick={() => navigate('/app/jobs')}>View requests</Button>
            <Button variant="outline" onClick={() => navigate('/app/account/drivers')}>
              Manage drivers
            </Button>
            <Button variant="outline" onClick={() => navigate('/app/account/vehicles')}>
              Manage vehicles
            </Button>
            <Button variant="outline" onClick={() => navigate('/app/account/verification')}>
              Verification
            </Button>
          </>
        ) : null}
        <Button variant="ghost" onClick={() => navigate('/app/account')}>
          Account
        </Button>
      </div>
    </div>
  );
}
