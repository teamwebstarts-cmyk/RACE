import * as React from 'react';

import { cn } from '@race/utils';

export function Avatar({
  src,
  alt,
  fallback,
  className,
}: {
  src?: string;
  alt: string;
  fallback: string;
  className?: string;
}) {
  const [error, setError] = React.useState(false);

  return (
    <div
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F5A623]/20 text-sm font-semibold text-[#D97706]',
        className,
      )}
    >
      {src && !error ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" onError={() => setError(true)} />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  );
}
