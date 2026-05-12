interface AdminMetricCardProps {
  label: string;
  value: string;
  helper: string;
}

export function AdminMetricCard({ label, value, helper }: AdminMetricCardProps) {
  return (
    <article className="surface-card p-5">
      <p className="text-sm font-medium text-[#6b5444]">{label}</p>
      <p className="mt-2 text-3xl font-bold text-[#2f241d]">{value}</p>
      <p className="mt-1 text-xs subtle-text">{helper}</p>
    </article>
  );
}
