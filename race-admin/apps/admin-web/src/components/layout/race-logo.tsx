import { cn } from '@race/utils';

export interface RaceLogoProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  showTagline?: boolean;
}

/**
 * Canonical RACE Service logo — uses official brand asset. Do not redesign.
 */
export function RaceLogo({
  width = 140,
  height = 56,
  className,
  showTagline = false,
}: RaceLogoProps) {
  return (
    <div className={cn('inline-flex flex-col items-start', className)}>
      <img
        src="/race-logo.png"
        alt="RACE Service"
        width={typeof width === 'number' ? width : undefined}
        height={typeof height === 'number' ? height : undefined}
        className="h-auto max-w-full object-contain"
        style={{ width, height: height === 'auto' ? undefined : height }}
      />
      {showTagline ? (
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[#555555]">
          24/7 Roadside Assistance
        </p>
      ) : null}
    </div>
  );
}
