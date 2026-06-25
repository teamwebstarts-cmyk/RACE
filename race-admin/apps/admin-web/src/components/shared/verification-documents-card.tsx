import type { VerificationStatus } from '@race/types';
import { Button, Card, CardContent, CardHeader, CardTitle, StatusBadge } from '@race/ui';

type VerificationDocument = {
  id: string;
  key?: string;
  name: string;
  status: VerificationStatus;
  uploadedAt: string;
  url?: string;
};

export function VerificationDocumentsCard({
  verificationStatus,
  documentsStatus,
  verificationStageLabel,
  reviewNotes,
  documents,
  onOpenDocument,
  onDownloadDocument,
  onVerifyDocument,
  onRejectDocument,
  reviewingDocumentId,
  actionError,
}: {
  verificationStatus: VerificationStatus;
  documentsStatus: VerificationStatus;
  verificationStageLabel?: string;
  reviewNotes?: string;
  documents: VerificationDocument[];
  onOpenDocument: (doc: VerificationDocument) => void | Promise<void>;
  onDownloadDocument?: (doc: VerificationDocument) => void | Promise<void>;
  onVerifyDocument?: (doc: VerificationDocument) => void | Promise<void>;
  onRejectDocument?: (doc: VerificationDocument) => void | Promise<void>;
  reviewingDocumentId?: string | null;
  actionError?: string | null;
}) {
  const canReview = Boolean(onVerifyDocument && onRejectDocument);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification &amp; Documentation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-[#FAFAFA] p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Verification</p>
            <div className="mt-2">
              <StatusBadge status={verificationStatus} />
            </div>
            {verificationStageLabel ? (
              <p className="mt-2 text-sm text-body">Stage: {verificationStageLabel}</p>
            ) : null}
          </div>
          <div className="rounded-lg border border-border bg-[#FAFAFA] p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Documents</p>
            <div className="mt-2">
              <StatusBadge status={documentsStatus} />
            </div>
            <p className="mt-2 text-sm text-body">
              {documents.filter((doc) => doc.status === 'VERIFIED').length} of {documents.length} verified
            </p>
          </div>
        </div>

        {actionError ? (
          <div className="rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
            {actionError}
          </div>
        ) : null}

        {reviewNotes ? (
          <div className="rounded-lg border border-warning/20 bg-warning/5 px-4 py-3 text-sm text-body">
            <span className="font-semibold text-heading">Admin notes: </span>
            {reviewNotes}
          </div>
        ) : null}

        <div>
          <p className="mb-3 text-sm font-semibold text-heading">Submitted Documents</p>
          {documents.length ? (
            <ul className="space-y-3">
              {documents.map((doc) => (
                <li
                  key={doc.id}
                  className="flex flex-col gap-3 rounded-lg border border-border px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-heading">{doc.name}</p>
                    <p className="text-xs text-muted">
                      Uploaded {new Date(doc.uploadedAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={doc.status} />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3"
                      disabled={!doc.url || reviewingDocumentId === doc.id}
                      onClick={() => void onOpenDocument(doc)}
                    >
                      Open
                    </Button>
                    {onDownloadDocument ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3"
                        disabled={!doc.url || reviewingDocumentId === doc.id}
                        onClick={() => void onDownloadDocument(doc)}
                      >
                        Download
                      </Button>
                    ) : null}
                    {canReview && doc.status === 'PENDING' ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 border-error/30 px-3 text-error hover:bg-error/10"
                          disabled={reviewingDocumentId === doc.id}
                          onClick={() => void onRejectDocument?.(doc)}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 px-3"
                          disabled={reviewingDocumentId === doc.id}
                          onClick={() => void onVerifyDocument?.(doc)}
                        >
                          {reviewingDocumentId === doc.id ? 'Saving...' : 'Verify'}
                        </Button>
                      </>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No documents submitted yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
