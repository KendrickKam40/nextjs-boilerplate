import type { OpenState } from '@/lib/site-hours';

export default function OpenChip({ state, className = '' }: { state: OpenState | null; className?: string }) {
  if (!state) return null;
  return (
    <span className={`b-open-chip ${className}`} data-open={state.open}>
      <span aria-hidden="true" />
      {state.label}
    </span>
  );
}
