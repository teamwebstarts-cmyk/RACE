import { useEffect, useState } from 'react';

import { Button } from '@race/ui';

import { Modal } from './modal';

export type FormFieldConfig = {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'select';
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
};

const inputClass =
  'flex h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40';

export function EntityFormModal({
  open,
  onClose,
  title,
  description,
  fields,
  initialValues = {},
  resetKey,
  onSubmit,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  fields: FormFieldConfig[];
  initialValues?: Record<string, string>;
  resetKey?: string;
  onSubmit: (values: Record<string, string>) => void | Promise<void>;
  loading?: boolean;
}) {
  const [values, setValues] = useState<Record<string, string>>(initialValues);

  useEffect(() => {
    if (open) setValues(initialValues);
  }, [open, resetKey, initialValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void onSubmit(values);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="mb-1.5 block text-sm font-semibold text-heading">
              {field.label}
              {field.required ? <span className="text-error"> *</span> : null}
            </label>
            {field.type === 'select' ? (
              <select
                className={inputClass}
                value={values[field.name] ?? ''}
                required={field.required}
                onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
              >
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type ?? 'text'}
                className={inputClass}
                placeholder={field.placeholder}
                required={field.required}
                value={values[field.name] ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
              />
            )}
          </div>
        ))}
      </form>
    </Modal>
  );
}
