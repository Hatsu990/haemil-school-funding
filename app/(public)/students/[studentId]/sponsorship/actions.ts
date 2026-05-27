"use server";

import { redirect } from "next/navigation";
import {
  createSponsorship,
  getBlockedStudentStatusFromSponsorshipError,
  isStudentNotFoundSponsorshipError,
} from "@/lib/repositories/sponsorships";
import { getStudentById } from "@/lib/repositories/students";
import { sendAdminNewSponsorshipSms } from "@/lib/sms/service";
import { getSponsorshipBlockedReason } from "@/lib/sponsorship/policy";
import {
  extractSponsorshipRequestValues,
  resolveSponsorshipPeriod,
  SponsorshipRequestState,
  validateSponsorshipRequestValues,
} from "@/lib/sponsorship/request-form";
import { StudentSponsorshipStatus } from "@/types";

function buildErrorState(
  values: SponsorshipRequestState["values"],
  formError: string | null,
  fieldErrors: SponsorshipRequestState["fieldErrors"] = {},
): SponsorshipRequestState {
  return {
    formError,
    fieldErrors,
    values,
  };
}

function isRequestBlockedStatus(status: StudentSponsorshipStatus): boolean {
  return status !== "available";
}

function isActiveSponsorshipDuplicateError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("UNIQUE constraint failed: sponsorships.student_id") ||
    message.includes("idx_sponsorships_student_active") ||
    message.includes("UNIQUE")
  );
}

export async function submitSponsorshipRequest(
  _prevState: SponsorshipRequestState,
  formData: FormData,
): Promise<SponsorshipRequestState> {
  const values = extractSponsorshipRequestValues(formData);
  const fieldErrors = validateSponsorshipRequestValues(values);

  if (Object.keys(fieldErrors).length > 0) {
    return buildErrorState(values, null, fieldErrors);
  }

  try {
    const sponsorshipType = values.sponsorshipType;
    if (!sponsorshipType) {
      return buildErrorState(values, "결연 방식 정보가 누락되었습니다.", {
        sponsorshipType: "결연 방식 정보가 누락되었습니다.",
      });
    }

    const firstCheckStudent = await getStudentById(values.studentId);
    if (!firstCheckStudent) {
      return buildErrorState(values, "선택한 학생 정보를 찾을 수 없습니다.");
    }

    if (isRequestBlockedStatus(firstCheckStudent.sponsorshipStatus)) {
      return buildErrorState(
        values,
        getSponsorshipBlockedReason(firstCheckStudent.sponsorshipStatus),
      );
    }

    let createdSponsorshipId: string | null = null;
    try {
      const createdSponsorship = await createSponsorship({
        studentId: values.studentId,
        sponsorName: values.sponsorName,
        sponsorPhone: values.sponsorPhone,
        sponsorEmail: values.sponsorEmail,
        sponsorshipType,
        sponsorshipPeriod: resolveSponsorshipPeriod(values),
        sponsorPublic: values.sponsorPublic === "public",
        sponsorMessage: values.sponsorMessage || null,
        receiptRequested: values.receiptRequested,
      });
      createdSponsorshipId = createdSponsorship.id;
    } catch (error) {
      const blockedStatus = getBlockedStudentStatusFromSponsorshipError(error);
      if (blockedStatus) {
        return buildErrorState(values, getSponsorshipBlockedReason(blockedStatus));
      }

      if (isStudentNotFoundSponsorshipError(error)) {
        return buildErrorState(values, "선택한 학생 정보를 찾을 수 없습니다.");
      }

      if (isActiveSponsorshipDuplicateError(error)) {
        return buildErrorState(
          values,
          "이미 다른 후원 신청이 접수되어 현재 신청할 수 없습니다.",
        );
      }
      throw error;
    }

    if (createdSponsorshipId) {
      try {
        await sendAdminNewSponsorshipSms(createdSponsorshipId);
      } catch (error) {
        console.error(
          "[sponsorship action] failed to send admin new sponsorship sms",
          error,
        );
      }
    }
  } catch (error) {
    console.error("[sponsorship action] failed to save sponsorship", error);
    return buildErrorState(
      values,
      "신청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    );
  }

  redirect(`/students/${values.studentId}/sponsorship?submitted=1`);
}
