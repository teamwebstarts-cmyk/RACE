import type { ReactNode } from 'react';

export function PageShell({
  children,
  narrow,
}: {
  children: ReactNode;
  narrow?: boolean;
}) {
  return (
    <div className="page">
      <div className="content-wrap" style={narrow ? { maxWidth: 720 } : undefined}>
        {children}
      </div>
    </div>
  );
}
