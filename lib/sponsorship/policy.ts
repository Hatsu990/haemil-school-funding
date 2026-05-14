import { StudentSponsorshipStatus } from "@/types";

export function isSponsorshipRequestable(
  status: StudentSponsorshipStatus,
): boolean {
  return status === "available";
}

export function getSponsorshipBlockedReason(
  status: StudentSponsorshipStatus,
): string {
  if (status === "pending") {
    return "입금 대기 상태에서는 다른 후원 신청이 불가합니다.";
  }

  if (status === "matched") {
    return "입금 완료로 결연이 완료된 학생은 신청할 수 없습니다.";
  }

  return "현재는 후원 신청이 불가한 상태입니다.";
}
