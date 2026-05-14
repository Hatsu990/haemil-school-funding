import { SponsorshipProgressStatus, StudentSponsorshipStatus } from "@/types";

export function getStudentStatusLabel(status: StudentSponsorshipStatus): string {
  if (status === "matched") return "결연완료";
  if (status === "pending") return "입금대기";
  return "신청가능";
}

export function getStudentStatusClass(status: StudentSponsorshipStatus): string {
  if (status === "matched") return "bg-[#e8f5eb] text-[#256f43]";
  if (status === "pending") return "bg-[#fff6df] text-[#915f00]";
  return "bg-[#eef2ff] text-[#3f4f9f]";
}

export function getSponsorshipStatusClass(
  status: SponsorshipProgressStatus,
): string {
  if (status === "입금완료") return "bg-[#e8f5eb] text-[#256f43]";
  if (status === "입금대기") return "bg-[#fff6df] text-[#915f00]";
  return "bg-[#f4ece8] text-[#7f5f4b]";
}

function parseDateValue(value: string): Date | null {
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const parsed = new Date(normalized);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  const utcParsed = new Date(`${normalized}Z`);
  if (!Number.isNaN(utcParsed.getTime())) {
    return utcParsed;
  }

  return null;
}

export function formatDateKorean(value: string): string {
  const date = parseDateValue(value);
  if (!date) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatDateTimeKorean(value: string): string {
  const date = parseDateValue(value);
  if (!date) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
