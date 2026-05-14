"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { STUDENT_PROFILE_FALLBACK_IMAGE_URL } from "@/lib/students/profile-images";

interface StudentProfileImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function StudentProfileImage({
  src,
  alt,
  className,
  priority = false,
}: StudentProfileImageProps) {
  const [hasError, setHasError] = useState(false);

  const resolvedSrc = useMemo(() => {
    const normalized = src?.trim();
    if (!hasError && normalized) {
      return normalized;
    }

    return STUDENT_PROFILE_FALLBACK_IMAGE_URL;
  }, [hasError, src]);

  return (
    <div
      className={`relative aspect-square overflow-hidden rounded-2xl border border-[var(--border)] bg-[#f8ecdf] ${className ?? ""}`}
    >
      <Image
        src={resolvedSrc}
        alt={alt}
        fill
        sizes="(max-width: 768px) 40vw, 160px"
        className="object-cover object-center"
        onError={() => setHasError(true)}
        priority={priority}
      />
    </div>
  );
}
