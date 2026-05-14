"use server";

import { revalidatePath } from "next/cache";
import {
  createStudent,
  deleteStudent,
  isStudentDeleteBlockedError,
  isStudentNotFoundError,
} from "@/lib/repositories/students";
import { StudentGender, StudentProfile, StudentSponsorshipStatus } from "@/types";

const VALID_GENDERS = new Set<StudentGender>(["남", "여", "미정"]);
const VALID_STATUSES = new Set<StudentSponsorshipStatus>([
  "available",
  "pending",
  "matched",
]);

export interface CreateStudentActionResult {
  ok: boolean;
  message: string;
  student?: StudentProfile;
}

export interface DeleteStudentActionResult {
  ok: boolean;
  message: string;
}

function isValidGender(value: string): value is StudentGender {
  return VALID_GENDERS.has(value as StudentGender);
}

function isValidStatus(value: string): value is StudentSponsorshipStatus {
  return VALID_STATUSES.has(value as StudentSponsorshipStatus);
}

export async function createStudentAction(
  formData: FormData,
): Promise<CreateStudentActionResult> {
  const nickname = String(formData.get("nickname") ?? "").trim();
  const genderRaw = String(formData.get("gender") ?? "").trim();
  const grade = String(formData.get("grade") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const statusRaw = String(formData.get("sponsorshipStatus") ?? "").trim();

  if (!nickname) {
    return { ok: false, message: "학생 닉네임을 입력해 주세요." };
  }
  if (!isValidGender(genderRaw)) {
    return { ok: false, message: "학생 성별을 선택해 주세요." };
  }
  if (!grade) {
    return { ok: false, message: "학년을 입력해 주세요." };
  }
  if (!description) {
    return { ok: false, message: "소개 문구를 입력해 주세요." };
  }
  if (!isValidStatus(statusRaw)) {
    return { ok: false, message: "초기 결연 상태가 올바르지 않습니다." };
  }

  try {
    const student = await createStudent({
      nickname,
      gender: genderRaw,
      grade,
      description,
      sponsorshipStatus: statusRaw,
    });

    revalidatePath("/admin/students");
    return {
      ok: true,
      message: "학생이 추가되었습니다.",
      student,
    };
  } catch (error) {
    console.error("[admin students action] failed to create student", error);
    return {
      ok: false,
      message: "학생 추가에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
}

export async function deleteStudentAction(id: string): Promise<DeleteStudentActionResult> {
  const studentId = id.trim();
  if (!studentId) {
    return { ok: false, message: "삭제할 학생 ID가 누락되었습니다." };
  }

  try {
    await deleteStudent(studentId);
    revalidatePath("/admin/students");
    return { ok: true, message: "학생이 삭제되었습니다." };
  } catch (error) {
    if (isStudentDeleteBlockedError(error)) {
      return {
        ok: false,
        message:
          "해당 학생은 후원 신청 이력이 있어 삭제할 수 없습니다. 상태 변경으로 관리해 주세요.",
      };
    }

    if (isStudentNotFoundError(error)) {
      return {
        ok: false,
        message: "학생 정보를 찾을 수 없습니다.",
      };
    }

    console.error("[admin students action] failed to delete student", error);
    return {
      ok: false,
      message: "학생 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
}
