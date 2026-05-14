interface FeedbackToastProps {
  type: "success" | "error" | "info";
  message: string;
  className?: string;
}

function getToastClass(type: FeedbackToastProps["type"]): string {
  if (type === "success") {
    return "toast-success";
  }

  if (type === "error") {
    return "toast-error";
  }

  return "rounded-xl border border-[var(--border)] bg-[#fff9f3] px-4 py-3 text-sm text-[#6d5545]";
}

export function FeedbackToast({ type, message, className }: FeedbackToastProps) {
  return (
    <p
      role={type === "error" ? "alert" : "status"}
      aria-live={type === "error" ? "assertive" : "polite"}
      className={`${getToastClass(type)} ${className ?? ""}`}
    >
      {message}
    </p>
  );
}
