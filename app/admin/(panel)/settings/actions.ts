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

export async function saveAdminSettingsAction(
  formData: FormData,
): Promise<SaveAdminSettingsActionResult> {
  const representativeContactPhone = String(
    formData.get("representativeContactPhone") ?? "",
  ).trim();
  const sponsorshipContactPhone = String(
    formData.get("sponsorshipContactPhone") ?? "",
  ).trim();
  const smsSenderPhoneDisplay = String(
    formData.get("smsSenderPhoneDisplay") ?? "",
  ).trim();
  const autoSmsSendTime = String(formData.get("autoSmsSendTime") ?? "").trim();

  if (!representativeContactPhone || !isValidPhoneText(representativeContactPhone)) {
    return {
      ok: false,
      message: "대표 연락 전화번호를 올바르게 입력해 주세요.",
    };
  }

  if (!sponsorshipContactPhone || !isValidPhoneText(sponsorshipContactPhone)) {
    return {
      ok: false,
      message: "장학금 결연 상담 전화번호를 올바르게 입력해 주세요.",
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

  try {
    await Promise.all([
      upsertSetting(
        ADMIN_SETTINGS_KEYS.representativeContactPhone,
        representativeContactPhone,
      ),
      upsertSetting(
        ADMIN_SETTINGS_KEYS.sponsorshipContactPhone,
        sponsorshipContactPhone,
      ),
      upsertSetting(
        ADMIN_SETTINGS_KEYS.smsSenderPhoneDisplay,
        smsSenderPhoneDisplay,
      ),
      upsertSetting(ADMIN_SETTINGS_KEYS.autoSmsSendTime, autoSmsSendTime),
    ]);
  } catch (error) {
    console.error("[admin settings action] failed to save settings", error);
    return {
      ok: false,
      message: "설정 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/");
  return {
    ok: true,
    message: "설정이 저장되었습니다.",
  };
}
