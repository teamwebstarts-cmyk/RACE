import { useEffect, useRef } from 'react';

type Props = {
  length?: number;
  value: string;
  onChange: (value: string) => void;
};

export function OtpInput({ length = 6, value, onChange }: Props) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.padEnd(length, ' ').slice(0, length).split('');

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const setAt = (index: number, char: string) => {
    const next = value.split('');
    while (next.length < length) next.push('');
    next[index] = char;
    onChange(next.join('').replace(/\s/g, '').slice(0, length));
  };

  return (
    <div className="otp-row">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          inputMode="numeric"
          maxLength={1}
          value={digits[index]?.trim() ?? ''}
          onChange={(e) => {
            const char = e.target.value.replace(/\D/g, '').slice(-1);
            setAt(index, char);
            if (char && index < length - 1) {
              refs.current[index + 1]?.focus();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !digits[index]?.trim() && index > 0) {
              refs.current[index - 1]?.focus();
            }
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
            onChange(pasted);
            const focusIndex = Math.min(pasted.length, length - 1);
            refs.current[focusIndex]?.focus();
          }}
          aria-label={`OTP digit ${index + 1}`}
        />
      ))}
    </div>
  );
}
