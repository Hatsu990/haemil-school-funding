"use server";

import { revalidatePath } from "next/cache";
import { upsertSetting } from "@/lib/repositories/settings";
import { ADMIN_SETTINGS_KEYS } from "@/lib/settings/admin-settings";

export interface SaveAdminSettingsActionResult {
  ok: boolean;
  message: string;
}

function isValidTimeFormat(value: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

function isValidPhoneText(value: string): boolean {
  return /^[0-9+\-()\s]{7,20}$/.test(value);
}

function normalizeBooleanFormValue(value: string): "true" | "false" | null {
  if (value === "true") {
    return "true";
  }

  if (value === "false") {
    return "false";
  }

  return null;
}

function parsePositiveInteger(value: string): number | null {
  if (!/^\d+$/.test(value)) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export async function saveAdminSettingsAction(
  formData: FormData,
): Promise<SaveAdminSettingsActionResult> {
  const adminContactPhone = String(formData.get("adminContactPhone") ?? "").trim();
  const smsSenderPhoneDisplay = String(
    formData.get("smsSenderPhoneDisplay") ?? "",
  ).trim();
  const autoSmsSendTime = String(formData.get("autoSmsSendTime") ?? "").trim();
  const sitePublicEnabledRaw = String(
    formData.get("sitePublicEnabled") ?? "",
  ).trim();
  const sponsorshipRequestEnabledRaw = String(
    formData.get("sponsorshipRequestEnabled") ?? "",
  ).trim();
  const defaultSponsorshipAmountRaw = String(
    formData.get("defaultSponsorshipAmount") ?? "",
  ).trim();
  const targetStudentCountRaw = String(
    formData.get("targetStudentCount") ?? "",
  ).trim();

  if (!adminContactPhone || !isValidPhoneText(adminContactPhone)) {
    return {
      ok: false,
      message: "관리자 알림 전화번호를 올바르게 입력해 주세요.",
    };
  }

  if (!smsSenderPhoneDisplay || !isValidPhoneText(smsSenderPhoneDisplay)) {
    return {
      ok: false,
      message: "문자 발신 번호 표시를 올바르게 입력해 주세요.",
    };
  }

  if (!isValidTimeFormat(autoSmsSendTime)) {
    return {
      ok: false,
      message: "일일 연락 알림 발송 시간을 HH:MM 형식으로 입력해 주세요.",
    };
  }

  const sitePublicEnabled = normalizeBooleanFormValue(sitePublicEnabledRaw);
  if (!sitePublicEnabled) {
    return {
      ok: false,
      message: "사이트 공개 여부 값이 올바르지 않습니다.",
    };
  }

  const sponsorshipRequestEnabled = normalizeBooleanFormValue(
    sponsorshipRequestEnabledRaw,
  );
  if (!sponsorshipRequestEnabled) {
    return {
      ok: false,
      message: "후원 신청 가능 여부 값이 올바르지 않습니다.",
    };
  }

  const defaultSponsorshipAmount = parsePositiveInteger(
    defaultSponsorshipAmountRaw,
  );
  if (!defaultSponsorshipAmount) {
    return {
      ok: false,
      message: "기본 후원 금액은 1 이상의 숫자로 입력해 주세요.",
    };
  }

  const targetStudentCount = parsePositiveInteger(targetStudentCountRaw);
  if (!targetStudentCount) {
    return {
      ok: false,
      message: "전체 목표 학생 수는 1 이상의 숫자로 입력해 주세요.",
    };
  }

  try {
    await Promise.all([
      upsertSetting(ADMIN_SETTINGS_KEYS.adminContactPhone, adminContactPhone),
      upsertSetting(
        ADMIN_SETTINGS_KEYS.smsSenderPhoneDisplay,
        smsSenderPhoneDisplay,
      ),
      upsertSetting(ADMIN_SETTINGS_KEYS.autoSmsSendTime, autoSmsSendTime),
      upsertSetting(ADMIN_SETTINGS_KEYS.sitePublicEnabled, sitePublicEnabled),
      upsertSetting(
        ADMIN_SETTINGS_KEYS.sponsorshipRequestEnabled,
        sponsorshipRequestEnabled,
      ),
      upsertSetting(
        ADMIN_SETTINGS_KEYS.defaultSponsorshipAmount,
        String(defaultSponsorshipAmount),
      ),
      upsertSetting(
        ADMIN_SETTINGS_KEYS.targetStudentCount,
        String(targetStudentCount),
      ),
    ]);
  } catch (error) {
    console.error("[admin settings action] failed to save settings", error);
    return {
      ok: false,
      message: "설정 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  revalidatePath("/admin/settings");
  return {
    ok: true,
    message: "설정이 저장되었습니다.",
  };
}
