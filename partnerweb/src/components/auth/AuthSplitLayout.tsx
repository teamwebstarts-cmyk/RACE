import type { ReactNode } from 'react';

import { BrandMark } from '../ui/BrandMark';

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function AuthSplitLayout({ title, subtitle, children }: Props) {
  return (
    <div className="page auth-page">
      <div className="auth-split">
        <div className="auth-visual partner-auth-visual">
          <div className="auth-visual-overlay">
            <BrandMark variant="dark" size="lg" />
            <div>
              <h2 style={{ fontSize: 'clamp(30px, 4vw, 40px)', marginBottom: 10 }}>{title}</h2>
              {subtitle ? (
                <p style={{ color: 'rgba(255,255,255,0.82)', maxWidth: 420, lineHeight: 1.55 }}>
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>
        </div>
        <div className="auth-panel">
          <div className="auth-panel-inner">{children}</div>
        </div>
      </div>
    </div>
  );
}
