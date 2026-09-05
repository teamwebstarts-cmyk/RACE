import { useNavigate } from 'react-router-dom';

import { RegistrationLayout } from '../../../components/registration/RegistrationLayout';
import { DRIVER_DOCUMENTS, DRIVER_REGISTRATION_STEPS } from '../../../constants/registration';
import { usePartnerRegistrationStore } from '../../../store/partnerRegistrationStore';

export function DriverDocumentsPage() {
  const navigate = useNavigate();
  const driverDocuments = usePartnerRegistrationStore((s) => s.driverDocuments);
  const addDriverDocument = usePartnerRegistrationStore((s) => s.addDriverDocument);
  const removeDriverDocument = usePartnerRegistrationStore((s) => s.removeDriverDocument);

  return (
    <RegistrationLayout
      title="Driver Registration"
      steps={DRIVER_REGISTRATION_STEPS}
      activeStep={3}
      onBack={() => navigate('/register/driver/vehicle')}
      onContinue={() => navigate('/register/driver/review')}
    >
      <p className="muted" style={{ marginBottom: 20 }}>
        Upload documents now or skip and add them later during review.
      </p>
      <div className="doc-list">
        {DRIVER_DOCUMENTS.map((doc) => {
          const uploaded = driverDocuments.find((item) => item.id === doc.id);
          return (
            <div key={doc.id} className="doc-row">
              <div>
                <strong>
                  {doc.label}
                  {doc.required ? ' *' : ''}
                </strong>
                {uploaded ? (
                  <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                    {uploaded.name}
                  </p>
                ) : (
                  <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                    Optional for now
                  </p>
                )}
              </div>
              <div className="doc-row-actions">
                {uploaded ? (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => removeDriverDocument(doc.id)}
                  >
                    Remove
                  </button>
                ) : null}
                <label className="btn btn-outline doc-upload-btn">
                  {uploaded ? 'Replace' : 'Upload'}
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const uri = URL.createObjectURL(file);
                      addDriverDocument({
                        id: doc.id,
                        label: doc.label,
                        uri,
                        name: file.name,
                        mimeType: file.type,
                        file,
                      });
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </RegistrationLayout>
  );
}
