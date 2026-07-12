import { useLocation, useNavigate } from 'react-router-dom';

import { images } from '../../assets';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/ui/ScreenHeader';

export function ComingSoonPage() {
  const navigate = useNavigate();
  const title =
    ((useLocation().state as { title?: string } | null)?.title) || 'This service';

  return (
    <div className="page">
      <div className="content-wrap" style={{ maxWidth: 720 }}>
        <ScreenHeader title="Coming soon" />
        <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
          <img
            src={images.repairImg}
            alt=""
            style={{ width: '100%', height: 240, objectFit: 'cover' }}
          />
          <div style={{ padding: 28 }}>
            <h1 style={{ fontSize: 28, marginBottom: 8 }}>{title} is almost ready</h1>
            <p className="muted" style={{ marginBottom: 20 }}>
              Multi-step booking flows are next. You can still manage vehicles, bookings, and SOS
              today.
            </p>
            <Button onClick={() => navigate('/app/home')}>Back to home</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
