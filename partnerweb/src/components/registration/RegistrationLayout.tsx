import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/Button';
import { ScreenHeader } from '../ui/ScreenHeader';

type Props = {
  title: string;
  steps: readonly string[];
  activeStep: number;
  onBack?: () => void;
  continueLabel?: string;
  onContinue?: () => void;
  continueDisabled?: boolean;
  children: ReactNode;
};

export function RegistrationLayout({
  title,
  steps,
  activeStep,
  onBack,
  continueLabel = 'Continue',
  onContinue,
  continueDisabled,
  children,
}: Props) {
  const navigate = useNavigate();

  return (
    <div className="page">
      <div className="content-wrap" style={{ maxWidth: 720 }}>
        <ScreenHeader title={title} onBack={onBack ?? (() => navigate(-1))} />
        <div className="step-bar" aria-label="Registration progress">
          {steps.map((label, index) => {
            const step = index + 1;
            const done = step < activeStep;
            const current = step === activeStep;
            return (
              <div key={label} className={`step-dot ${done ? 'done' : ''} ${current ? 'current' : ''}`}>
                <span className="step-dot-index">{step}</span>
                <span className="step-dot-label">{label}</span>
              </div>
            );
          })}
        </div>
        <div className="registration-body">{children}</div>
        {onContinue ? (
          <div className="form-actions" style={{ marginTop: 28 }}>
            <Button block onClick={onContinue} disabled={continueDisabled}>
              {continueLabel}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
