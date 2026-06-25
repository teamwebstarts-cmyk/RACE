import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Eye, MoreVertical, Pencil, Trash2 } from 'lucide-react';

import { cn } from '@race/utils';

const MENU_WIDTH = 140;
const MENU_ITEM_HEIGHT = 36;

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
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const actionCount = [onView, onEdit, onDelete].filter(Boolean).length;

  const updatePosition = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight ?? actionCount * MENU_ITEM_HEIGHT + 8;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < menuHeight + 8 && rect.top > menuHeight + 8;

    const top = openUp ? rect.top - menuHeight - 4 : rect.bottom + 4;
    const left = Math.max(8, Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8));

    setCoords({ top: Math.max(8, top), left });
  }, [actionCount]);

  const runAction = useCallback((action?: () => void) => {
    if (!action) return;
    setOpen(false);
    action();
  }, []);

  const isEventInsideMenu = useCallback((event: Event) => {
    const target = event.target;
    if (!(target instanceof Node)) return false;
    if (buttonRef.current?.contains(target)) return true;
    if (menuRef.current?.contains(target)) return true;
    return false;
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }
    updatePosition();
    requestAnimationFrame(updatePosition);
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    function handlePointerDown(event: PointerEvent) {
      if (isEventInsideMenu(event)) return;
      setOpen(false);
    }

    function handleScroll(event: Event) {
      if (isEventInsideMenu(event)) return;
      setOpen(false);
    }

    const frameId = window.requestAnimationFrame(() => {
      document.addEventListener('pointerdown', handlePointerDown);
    });

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.cancelAnimationFrame(frameId);
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [open, isEventInsideMenu, updatePosition]);

  const menu =
    open && coords
      ? createPortal(
          <div
            ref={menuRef}
            data-row-action="menu"
            className="fixed z-[9999] min-w-[140px] overflow-hidden rounded-lg border border-border bg-surface py-1 shadow-card"
            style={{ top: coords.top, left: coords.left }}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
          >
            {onView ? (
              <ActionItem icon={Eye} label="View" onSelect={() => runAction(onView)} />
            ) : null}
            {onEdit ? (
              <ActionItem icon={Pencil} label="Edit" onSelect={() => runAction(onEdit)} />
            ) : null}
            {onDelete ? (
              <ActionItem
                icon={Trash2}
                label="Delete"
                className="text-error hover:bg-error/10"
                onSelect={() => runAction(onDelete)}
              />
            ) : null}
          </div>,
          document.body,
        )
      : null;

  return (
    <div data-row-action="trigger" onClick={(event) => event.stopPropagation()}>
      <button
        ref={buttonRef}
        type="button"
        className="rounded-md p-1 text-muted hover:bg-background hover:text-heading"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        aria-label="Row actions"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {menu}
    </div>
  );
}

function ActionItem({
  icon: Icon,
  label,
  onSelect,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onSelect: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-body hover:bg-background',
        className,
      )}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onSelect();
      }}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
