interface StatusPillProps {
  label: string;
  className: string;
}

export function StatusPill({ label, className }: StatusPillProps) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  );
}
