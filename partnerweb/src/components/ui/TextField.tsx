import type { InputHTMLAttributes, ReactNode } from 'react';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'children'> & {
  label?: ReactNode;
  error?: string;
  hint?: ReactNode;
};

export function TextField({ label, error, hint, id, ...rest }: Props) {
  const fieldId = id || rest.name;
  return (
    <div className="field">
      {label ? <label htmlFor={fieldId}>{label}</label> : null}
      <input id={fieldId} {...rest} />
      {error ? <div className="field-error">{error}</div> : null}
      {hint}
    </div>
  );
}
