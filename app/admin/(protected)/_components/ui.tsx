'use client';

import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, X } from 'lucide-react';

export type Status = { type: 'idle' | 'success' | 'error'; message?: string };

/** Announces results; errors interrupt, successes wait their turn. */
export function StatusMessage({ status }: { status: Status }) {
  return (
    <div aria-live="polite" className="min-h-6 text-sm">
      {status.type === 'success' && <p className="font-semibold text-[var(--a-success)]">{status.message}</p>}
      {status.type === 'error' && (
        <p role="alert" className="font-semibold text-[var(--a-danger)]">
          {status.message}
        </p>
      )}
    </div>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  /** Looks and reads as unavailable but keeps keyboard focus (unlike `disabled`). */
  inactive?: boolean;
};

const VARIANTS = {
  primary:
    'bg-[var(--a-primary)] text-[var(--a-on-primary)] hover:bg-[var(--a-primary-hover)] border border-transparent',
  secondary: 'bg-[var(--a-surface)] text-[var(--a-ink)] border border-[var(--a-line)] hover:bg-[var(--a-sunken)]',
  danger: 'bg-[var(--a-danger)] text-[var(--a-on-danger)] border border-transparent hover:opacity-90',
  ghost: 'bg-transparent text-[var(--a-ink)] border border-transparent hover:bg-[var(--a-sunken)]',
};

export function Button({ variant = 'secondary', className = '', inactive = false, onClick, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      {...props}
      aria-disabled={inactive || undefined}
      onClick={(event) => {
        if (inactive) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
    />
  );
}

export const FIELD_CLASS =
  'min-h-11 rounded-lg border border-[var(--a-field)] bg-[var(--a-surface)] px-3 text-base';

export function IconButton({
  label,
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...props}
      className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-[var(--a-line)] bg-[var(--a-surface)] text-[var(--a-ink)] transition-colors hover:bg-[var(--a-sunken)] disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
}

/** Keyboard and touch alternative to dragging. */
export function MoveButtons({
  name,
  index,
  count,
  onMove,
}: {
  name: string;
  index: number;
  count: number;
  onMove: (delta: -1 | 1) => void;
}) {
  return (
    <div className="flex gap-2">
      <IconButton label={`Move ${name} up`} disabled={index === 0} onClick={() => onMove(-1)}>
        <ArrowUp className="h-4 w-4" aria-hidden="true" />
      </IconButton>
      <IconButton label={`Move ${name} down`} disabled={index === count - 1} onClick={() => onMove(1)}>
        <ArrowDown className="h-4 w-4" aria-hidden="true" />
      </IconButton>
    </div>
  );
}

export function moveItem<T>(list: T[], index: number, delta: number) {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
}

/** Native modal dialog: focus trap, Escape and focus return come from the platform. */
export function AdminDialog({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<Element | null>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocus.current = document.activeElement;
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
      const target = returnFocus.current;
      if (target instanceof HTMLElement && target.isConnected) target.focus();
    }
  }, [open]);
  const titleId = `dialog-${title.replace(/\W+/g, '-').toLowerCase()}`;
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="m-auto w-[min(560px,calc(100vw-32px))] max-h-[85dvh] rounded-2xl border border-[var(--a-line)] bg-[var(--a-surface)] p-0 text-[var(--a-ink)] shadow-xl"
    >
      {open && (
        <div className="flex max-h-[85dvh] flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-[var(--a-line)] px-5 py-3">
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            <IconButton label="Close" onClick={onClose} className="border-transparent">
              <X className="h-5 w-5" aria-hidden="true" />
            </IconButton>
          </div>
          <div className="overflow-y-auto px-5 py-4">{children}</div>
        </div>
      )}
    </dialog>
  );
}

export function Panel({ title, description, children, actions }: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="space-y-5 rounded-2xl border border-[var(--a-line)] bg-[var(--a-surface)] p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">{title}</h2>
          {description && <p className="max-w-prose text-sm text-[var(--a-muted)]">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
