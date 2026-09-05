import { useEffect, useState } from 'react';

import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { getApiErrorMessage } from '../../services/api';
import { getVendorStatus } from '../../services/vendorService';
import type { VendorProfileResponse, VerificationStage } from '../../types/vendor';

const STAGES: Array<{ id: VerificationStage; label: string }> = [
  { id: 'submitted', label: 'Submitted' },
  { id: 'document_review', label: 'Document review' },
  { id: 'background_check', label: 'Background check' },
  { id: 'selfie_match', label: 'Selfie match' },
  { id: 'approved', label: 'Approved' },
];

function stageIndex(stage?: VerificationStage | string) {
  if (!stage) return 0;
  if (stage === 'rejected') return -1;
  const idx = STAGES.findIndex((s) => s.id === stage);
  return idx >= 0 ? idx : 0;
}

export function VerificationPage() {
  const [vendor, setVendor] = useState<VendorProfileResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        setVendor(await getVendorStatus());
      } catch (err) {
        setError(getApiErrorMessage(err, 'Unable to load verification status'));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const current = stageIndex(vendor?.verificationStage);
  const rejected = vendor?.verificationStage === 'rejected' || vendor?.status === 'rejected';

  return (
    <div className="page-section">
      <ScreenHeader title="Verification" />
      {error ? <div className="toast-error">{error}</div> : null}
      {loading ? (
        <div className="loading-inline">
          <div className="spinner" />
        </div>
      ) : vendor ? (
        <>
          <div className="status-card" style={{ marginTop: 8 }}>
            <div>
              <strong style={{ textTransform: 'capitalize' }}>
                {vendor.status.replace(/_/g, ' ')}
              </strong>
              <p className="muted" style={{ marginTop: 4, fontSize: 13 }}>
                {vendor.businessName || vendor.ownerName || 'Your application'}
              </p>
              {vendor.reviewNotes ? (
                <p style={{ marginTop: 8, fontSize: 14 }}>{vendor.reviewNotes}</p>
              ) : null}
            </div>
          </div>

          <div className="verification-timeline">
            {STAGES.map((stage, index) => {
              const done = !rejected && index <= current;
              const isCurrent = !rejected && index === current;
              return (
                <div
                  key={stage.id}
                  className={`timeline-item ${done ? 'done' : ''} ${isCurrent ? 'current' : ''}`}
                >
                  <span className="timeline-dot" />
                  <div>
                    <strong>{stage.label}</strong>
                    {isCurrent ? (
                      <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>
                        Current stage
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
            {rejected ? (
              <div className="timeline-item rejected">
                <span className="timeline-dot" />
                <div>
                  <strong>Rejected</strong>
                  <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>
                    Contact RACE support if you need to re-apply.
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {vendor.statusHistory?.length ? (
            <>
              <h3 className="section-title">History</h3>
              <div className="review-card">
                {vendor.statusHistory.map((item, index) => (
                  <div key={`${item.changedAt}-${index}`} className="review-row">
                    <span className="muted">{item.status.replace(/_/g, ' ')}</span>
                    <strong>{new Date(item.changedAt).toLocaleString()}</strong>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </>
      ) : (
        <p className="muted">No vendor profile found.</p>
      )}
    </div>
  );
}
