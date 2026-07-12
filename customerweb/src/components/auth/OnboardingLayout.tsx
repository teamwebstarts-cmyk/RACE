import type { ReactNode } from 'react';

import { images } from '../../assets';
import { BrandMark } from '../ui/BrandMark';

const STEPS = [
  { id: 'profile', label: 'Profile' },
  { id: 'pin', label: 'PIN' },
  { id: 'vehicle', label: 'Vehicle' },
  { id: 'qr', label: 'QR' },
] as const;

type StepId = (typeof STEPS)[number]['id'];

type Props = {
  step: StepId;
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function OnboardingLayout({ step, title, subtitle, children }: Props) {
  const activeIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="page auth-page">
      <div className="auth-split">
        <div className="auth-visual">
          <img
            src={
              step === 'vehicle' || step === 'qr'
                ? images.towingHero
                : step === 'pin'
                  ? images.driverHero
                  : images.splashHero
            }
            alt=""
          />
          <div className="auth-visual-overlay">
            <BrandMark variant="dark" size="lg" />
            <div>
              <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 36px)', marginBottom: 8 }}>
                Customer registration
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: 420, lineHeight: 1.55 }}>
                Set up your profile, secure PIN, and vehicles so SOS and bookings work instantly.
              </p>
            </div>
          </div>
        </div>

        <div className="auth-panel" style={{ alignItems: 'flex-start', overflowY: 'auto' }}>
          <div className="auth-panel-inner" style={{ maxWidth: 520, paddingBlock: 12 }}>
            <div className="onboard-steps" aria-label="Registration progress">
              {STEPS.map((item, index) => (
                <div
                  key={item.id}
                  className={`onboard-step ${index <= activeIndex ? 'active' : ''} ${index === activeIndex ? 'current' : ''}`}
                >
                  <span className="onboard-step-dot">{index + 1}</span>
                  <span className="onboard-step-label">{item.label}</span>
                </div>
              ))}
            </div>

            <h1 style={{ fontSize: 30, marginTop: 8 }}>{title}</h1>
            {subtitle ? (
              <p className="muted" style={{ marginBottom: 20, marginTop: 6 }}>
                {subtitle}
              </p>
            ) : (
              <div style={{ marginBottom: 16 }} />
            )}

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
