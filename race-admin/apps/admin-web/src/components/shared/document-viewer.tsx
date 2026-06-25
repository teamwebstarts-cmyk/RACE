import { FileText, X } from 'lucide-react';

import { Button, StatusBadge } from '@race/ui';

export interface DocumentViewerProps {
  open: boolean;
  onClose: () => void;
  document: {
    name: string;
    status: string;
    url?: string;
    uploadedAt: string;
  } | null;
  canReview?: boolean;
  onVerify?: () => void;
  onReject?: () => void;
  reviewing?: boolean;
}

export function DocumentViewer({
  open,
  onClose,
  document,
  canReview = false,
  onVerify,
  onReject,
  reviewing = false,
}: DocumentViewerProps) {
  if (!open || !document) return null;

  const showReviewActions = canReview && document.status === 'PENDING' && onVerify && onReject;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Close document viewer"
      />
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F5A623]/15">
              <FileText className="h-5 w-5 text-[#F5A623]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#1A1A2E]">{document.name}</h3>
              <div className="mt-1 flex items-center gap-2">
                <StatusBadge status={document.status} />
                <span className="text-xs text-[#9CA3AF]">
                  Uploaded {new Date(document.uploadedAt).toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-[#9CA3AF] hover:bg-[#F4F5F7] hover:text-[#555555]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6 flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-[#EEEEEE] bg-[#FAFAFA] p-8 text-center">
          <div>
            <FileText className="mx-auto mb-2 h-12 w-12 text-[#D1D5DB]" />
            <p className="text-sm font-medium text-[#1A1A2E]">{document.name}</p>
            <p className="mt-1 text-xs text-[#9CA3AF]">
              {document.url ?? 'Document preview will load from backend storage'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={reviewing}>
            Close
          </Button>
          {showReviewActions ? (
            <>
              <Button
                variant="outline"
                className="border-error/30 text-error hover:bg-error/10"
                onClick={onReject}
                disabled={reviewing}
              >
                Reject
              </Button>
              <Button onClick={onVerify} disabled={reviewing}>
                {reviewing ? 'Saving...' : 'Verify'}
              </Button>
            </>
          ) : (
            <Button disabled={!document.url}>Download</Button>
          )}
        </div>
      </div>
    </div>
  );
}
