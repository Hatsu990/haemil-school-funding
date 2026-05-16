"use server";

import { revalidatePath } from "next/cache";
import {
  getSponsorshipById,
  isInvalidSponsorshipStatusError,
  resetSponsorshipsAndStudentStatuses,
  updateSponsorshipStatus,
} from "@/lib/repositories/sponsorships";
import { sendSponsorshipConfirmedSms } from "@/lib/sms/service";
import { SponsorshipProgressStatus } from "@/types";

const VALID_STATUSES = new Set<SponsorshipProgressStatus>([
  "입금대기",
  "입금완료",
  "취소",
]);

export interface UpdateSponsorshipStatusActionInput {
  id: string;
  status: SponsorshipProgressStatus;
}

export interface UpdateSponsorshipStatusActionResult {
  ok: boolean;
  message: string;
  status?: SponsorshipProgressStatus;
}

export interface ResetSponsorshipsActionResult {
  ok: boolean;
  message: string;
  deletedSponsorshipCount?: number;
  resetStudentCount?: number;
}

function isValidStatus(value: string): value is SponsorshipProgressStatus {
  return VALID_STATUSES.has(value as SponsorshipProgressStatus);
}

export async function updateSponsorshipStatusAction(
  input: UpdateSponsorshipStatusActionInput,
): Promise<UpdateSponsorshipStatusActionResult> {
  const id = input.id?.trim();
  const status = String(input.status ?? "").trim();

  if (!id) {
    return {
      ok: false,
      message: "변경할 신청 ID가 누락되었습니다.",
    };
  }

  if (!isValidStatus(status)) {
    return {
      ok: false,
      message: "잘못된 상태값입니다.",
    };
  }

  try {
    const beforeUpdate = await getSponsorshipById(id);
    await updateSponsorshipStatus(id, status);
    let smsFailed = false;

    if (
      status === "입금완료" &&
      beforeUpdate &&
      beforeUpdate.status !== "입금완료"
    ) {
      try {
        const smsResult = await sendSponsorshipConfirmedSms(id);
        if (!smsResult.ok) {
          smsFailed = true;
          console.error(
            "[admin sponsorships action] sponsorship confirmed sms failed",
            smsResult.responseMessage,
          );
        }
      } catch (error) {
        console.error(
          "[admin sponsorships action] failed to send sponsorship confirmed sms",
          error,
        );
        smsFailed = true;
      }
    }

    revalidatePath("/admin/sponsorships");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/students");
    revalidatePath("/students");
    revalidatePath("/");
    return {
      ok: true,
      message: smsFailed
        ? "상태는 저장되었지만 문자 발송에 실패했습니다. 문자 이력을 확인해 주세요."
        : "상태가 저장되었습니다.",
      status,
    };
  } catch (error) {
    if (isInvalidSponsorshipStatusError(error)) {
      return {
        ok: false,
        message: "잘못된 상태값입니다.",
      };
    }

    console.error(
      "[admin sponsorships action] failed to update sponsorship status",
      error,
    );
    return {
      ok: false,
      message: "상태 변경에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
}

export async function resetSponsorshipsAction(): Promise<ResetSponsorshipsActionResult> {
  try {
    const result = await resetSponsorshipsAndStudentStatuses();

    revalidatePath("/admin/sponsorships");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/students");
    revalidatePath("/students");
    revalidatePath("/");

    return {
      ok: true,
      message: "결연 신청 목록을 초기화하고 학생 상태를 신청 가능으로 되돌렸습니다.",
      deletedSponsorshipCount: result.deletedSponsorshipCount,
      resetStudentCount: result.resetStudentCount,
    };
  } catch (error) {
    console.error("[admin sponsorships action] failed to reset sponsorship list", error);
    return {
      ok: false,
      message: "결연 신청 목록 초기화에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
}
