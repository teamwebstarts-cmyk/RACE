type Props = {
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
};

/** Text wordmark — avoids white-boxed PNG logos on dark heroes. */
export function BrandMark({ variant = 'light', size = 'md' }: Props) {
  const fontSize = size === 'lg' ? 34 : size === 'sm' ? 20 : 26;
  const color = variant === 'dark' ? '#FFFFFF' : '#F5A800';
  const subColor = variant === 'dark' ? 'rgba(255,255,255,0.72)' : '#666666';

  return (
    <div className="brand-lockup" style={{ color }} aria-label="RACE Service">
      <span className="brand-lockup-word" style={{ fontSize }}>
        RACE
      </span>
      <span className="brand-lockup-sub" style={{ color: subColor }}>
        SERVICE
      </span>
    </div>
  );
}
