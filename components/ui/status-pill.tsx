interface StatusPillProps {
  label: string;
  className: string;
}

export function StatusPill({ label, className }: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-black/5 px-3 py-1 text-xs font-semibold shadow-sm ${className}`}
      aria-label={`상태: ${label}`}
    >
      <span className="status-dot bg-current opacity-60" />
      {label}
    </span>
  );
}
