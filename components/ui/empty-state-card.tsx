interface EmptyStateCardProps {
  title: string;
  description: string;
  className?: string;
}

export function EmptyStateCard({
  title,
  description,
  className,
}: EmptyStateCardProps) {
  return (
    <div
      className={`surface-card rounded-2xl border-dashed p-6 text-center text-sm ${className ?? ""}`}
    >
      <p className="font-semibold text-[#5f4a3c]">{title}</p>
      <p className="mt-2 leading-7 subtle-text">{description}</p>
    </div>
  );
}
