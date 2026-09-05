import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  block?: boolean;
  children: ReactNode;
};

export function Button({
  variant = 'primary',
  block,
  className = '',
  children,
  ...rest
}: Props) {
  return (
    <button
      className={`btn btn-${variant} ${block ? 'btn-block' : ''} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}
