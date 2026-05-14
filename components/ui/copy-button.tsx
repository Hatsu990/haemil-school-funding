"use client";

import { useState } from "react";

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
}

export function CopyButton({ value, label = "복사", className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value.trim()) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("[copy button] failed to copy text", error);
    }
  };

  return (
    <button
      type="button"
      aria-label={`${label}: ${value}`}
      onClick={handleCopy}
      className={`rounded-lg border border-[var(--border)] bg-white px-2 py-1 text-[11px] font-semibold text-[#7a5d4a] hover:bg-[#fff4e9] ${className ?? ""}`}
    >
      {copied ? "복사됨" : label}
    </button>
  );
}
