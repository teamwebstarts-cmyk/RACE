import { useNavigate } from 'react-router-dom';

import { RegistrationLayout } from '../../../components/registration/RegistrationLayout';
import { VENDOR_DOCUMENTS, VENDOR_REGISTRATION_STEPS } from '../../../constants/registration';
import { usePartnerRegistrationStore } from '../../../store/partnerRegistrationStore';

export function VendorDocumentsPage() {
  const navigate = useNavigate();
  const vendorDocuments = usePartnerRegistrationStore((s) => s.vendorDocuments);
  const addVendorDocument = usePartnerRegistrationStore((s) => s.addVendorDocument);
  const removeVendorDocument = usePartnerRegistrationStore((s) => s.removeVendorDocument);

  return (
    <RegistrationLayout
      title="Vendor Registration"
      steps={VENDOR_REGISTRATION_STEPS}
      activeStep={3}
      onBack={() => navigate('/register/vendor/address')}
      onContinue={() => navigate('/register/vendor/review')}
    >
      <p className="muted" style={{ marginBottom: 20 }}>
        Upload documents now — uploads are best-effort after you submit.
      </p>
      <div className="doc-list">
        {VENDOR_DOCUMENTS.map((doc) => {
          const uploaded = vendorDocuments.find((item) => item.id === doc.id);
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
                    onClick={() => removeVendorDocument(doc.id)}
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
                      addVendorDocument({
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
