import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

type Props = {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
};

export function ScreenHeader({ title, onBack, right }: Props) {
  const navigate = useNavigate();
  return (
    <div className="screen-header">
      <button
        type="button"
        className="icon-btn"
        onClick={() => (onBack ? onBack() : navigate(-1))}
        aria-label="Go back"
      >
        <ArrowLeft size={18} />
      </button>
      <h1>{title}</h1>
      {right}
    </div>
  );
}
