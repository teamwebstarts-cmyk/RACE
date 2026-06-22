import { cn } from '@race/utils';

export type RaceLogoLayout = 'default' | 'sidebar' | 'sidebar-icon';

export interface RaceLogoProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  showTagline?: boolean;
  layout?: RaceLogoLayout;
}

/**
 * Canonical RACE Service logo — uses official brand asset. Do not redesign.
 * Sidebar layouts scale the asset to offset built-in PNG padding.
 */
export function RaceLogo({
  width = 140,
  height = 56,
  className,
  showTagline = false,
  layout = 'default',
}: RaceLogoProps) {
  if (layout === 'sidebar') {
    return (
      <div className={cn('h-full w-full overflow-hidden', className)}>
        <img
          src="/race-logo.png"
          alt="RACE Service"
          className="h-full w-auto max-w-none select-none object-contain object-left"
          style={{ transform: 'scale(3.15)', transformOrigin: 'left center' }}
          draggable={false}
        />
      </div>
    );
  }

  if (layout === 'sidebar-icon') {
    return (
      <div className={cn('h-12 w-12 overflow-hidden', className)}>
        <img
          src="/race-logo.png"
          alt="RACE Service"
          className="h-12 w-auto max-w-none select-none object-contain object-left"
          style={{ transform: 'scale(3.4)', transformOrigin: 'left center' }}
          draggable={false}
        />
      </div>
    );
  }

  return (
    <div className={cn('inline-flex flex-col items-start', className)}>
      <img
        src="/race-logo.png"
        alt="RACE Service"
        width={typeof width === 'number' ? width : undefined}
        height={typeof height === 'number' ? height : undefined}
        className="h-auto max-w-full object-contain object-left"
        style={{
          width: typeof width === 'number' ? width : width,
          height: height === 'auto' ? undefined : height,
          maxHeight: typeof height === 'number' ? height : undefined,
        }}
        draggable={false}
      />
      {showTagline ? (
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[#555555]">
          24/7 Roadside Assistance
        </p>
      ) : null}
    </div>
  );
}
