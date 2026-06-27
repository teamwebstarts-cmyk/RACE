import { Loader2 } from 'lucide-react';

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-[#555555]">
      <Loader2 className="h-8 w-8 animate-spin text-[#F5A623]" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function ErrorState({
  message = 'Something went wrong',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-center">
      <p className="text-sm font-medium text-[#DC2626]">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-md bg-[#F5A623] px-4 py-2 text-sm font-medium text-white"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title = 'No data found',
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 text-center">
      <p className="text-sm font-medium text-[#1A1A2E]">{title}</p>
      {description ? <p className="text-sm text-[#555555]">{description}</p> : null}
    </div>
  );
}
