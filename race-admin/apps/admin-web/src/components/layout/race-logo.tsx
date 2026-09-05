import { cn } from '@race/utils';

export type RaceLogoLayout = 'default' | 'sidebar' | 'sidebar-icon';

export interface RaceLogoProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  showTagline?: boolean;
  layout?: RaceLogoLayout;
  align?: 'left' | 'center';
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
  align = 'left',
}: RaceLogoProps) {
  if (layout === 'sidebar') {
    return (
      <div
        className={cn(
          'flex h-[72px] w-full min-w-0 items-center justify-center',
          className,
        )}
      >
        <img
          src="/race-logo-sidebar.png"
          alt="RACE Service"
          className="h-[70px] w-full max-w-[200px] select-none object-contain object-center"
          draggable={false}
        />
      </div>
    );
  }

  if (layout === 'sidebar-icon') {
    return (
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden',
          className,
        )}
      >
        <img
          src="/race-logo-sidebar.png"
          alt="RACE Service"
          className="h-10 w-auto max-w-none select-none object-contain object-left"
          draggable={false}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex flex-col',
        align === 'center' ? 'w-full items-center' : 'items-start',
        className,
      )}
    >
      <img
        src="/race-logo.png"
        alt="RACE Service"
        width={typeof width === 'number' ? width : undefined}
        height={typeof height === 'number' ? height : undefined}
        className={cn(
          'h-auto max-w-full object-contain',
          align === 'center' ? 'mx-auto object-center' : 'object-left',
        )}
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
