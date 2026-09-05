import { PageShell } from '../../components/layout/PageShell';
import { ScreenHeader } from '../../components/ui/ScreenHeader';

export function SettingsPage() {
  return (
    <PageShell narrow>
      <ScreenHeader title="Settings" />
      <div className="card">
        <strong>App</strong>
        <p className="muted" style={{ marginTop: 8 }}>
          RACE Customer Web · Phase 1
        </p>
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <strong>Notifications</strong>
        <p className="muted" style={{ marginTop: 8 }}>
          Push notification preferences will sync with the mobile app in a later release.
        </p>
      </div>
    </PageShell>
  );
}

export function HelpSupportPage() {
  return (
    <PageShell narrow>
      <ScreenHeader title="Help & support" />
      <div className="card">
        <strong>Call support</strong>
        <p className="muted" style={{ marginTop: 8 }}>
          +91 674 200 0000
        </p>
        <a className="btn btn-primary" href="tel:+916742000000" style={{ marginTop: 12 }}>
          Call now
        </a>
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <strong>Email</strong>
        <p className="muted" style={{ marginTop: 8 }}>
          support@raceservice.in
        </p>
      </div>
    </PageShell>
  );
}

export function NotificationsPage() {
  return (
    <PageShell narrow>
      <ScreenHeader title="Notifications" />
      <div className="empty-state">
        <h3>You are all caught up</h3>
        <p className="muted" style={{ marginTop: 8 }}>
          Booking updates and SOS alerts will appear here.
        </p>
      </div>
    </PageShell>
  );
}

export function SavedLocationsPage() {
  return (
    <PageShell narrow>
      <ScreenHeader title="Saved locations" />
      <div className="list">
        {['Home · Patia', 'Office · Infocity', 'Airport'].map((label) => (
          <div key={label} className="list-row">
            <div className="meta">
              <strong>{label}</strong>
              <span>Bhubaneswar, Odisha</span>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
