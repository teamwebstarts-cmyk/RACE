import { useEffect, useRef, useState } from 'react';
import { Eye, MoreVertical, Pencil, Trash2 } from 'lucide-react';

import { cn } from '@race/utils';

export function RowActionsMenu({
  onView,
  onEdit,
  onDelete,
}: {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="rounded-md p-1 text-muted hover:bg-background hover:text-heading"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label="Row actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open ? (
        <div
          className="absolute right-0 top-full z-50 mt-1 min-w-[140px] overflow-hidden rounded-lg border border-border bg-surface py-1 shadow-card"
          onClick={(e) => e.stopPropagation()}
        >
          {onView ? (
            <ActionItem icon={Eye} label="View" onClick={() => { onView(); setOpen(false); }} />
          ) : null}
          {onEdit ? (
            <ActionItem icon={Pencil} label="Edit" onClick={() => { onEdit(); setOpen(false); }} />
          ) : null}
          {onDelete ? (
            <ActionItem
              icon={Trash2}
              label="Delete"
              className="text-error hover:bg-error/10"
              onClick={() => { onDelete(); setOpen(false); }}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ActionItem({
  icon: Icon,
  label,
  onClick,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-body hover:bg-background',
        className,
      )}
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
