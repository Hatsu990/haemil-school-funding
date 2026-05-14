import { Setting } from "@/types";

export const ADMIN_SETTINGS_KEYS = {
  adminContactPhone: "admin_contact_phone",
  smsSenderPhoneDisplay: "sms_sender_phone_display",
  autoSmsSendTime: "auto_sms_send_time",
  sitePublicEnabled: "site_public_enabled",
  sponsorshipRequestEnabled: "sponsorship_request_enabled",
  defaultSponsorshipAmount: "default_sponsorship_amount",
  targetStudentCount: "target_student_count",
} as const;

export interface AdminSettingsFormValues {
  adminContactPhone: string;
  smsSenderPhoneDisplay: string;
  autoSmsSendTime: string;
  sitePublicEnabled: "true" | "false";
  sponsorshipRequestEnabled: "true" | "false";
  defaultSponsorshipAmount: string;
  targetStudentCount: string;
}

export const ADMIN_SETTINGS_DEFAULT_VALUES: AdminSettingsFormValues = {
  adminContactPhone: "010-0000-0000",
  smsSenderPhoneDisplay: "010-0000-0000",
  autoSmsSendTime: "19:00",
  sitePublicEnabled: "true",
  sponsorshipRequestEnabled: "true",
  defaultSponsorshipAmount: "100000",
  targetStudentCount: "60",
};

function normalizeBooleanString(value: string | undefined): "true" | "false" {
  if (!value) {
    return "false";
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "true" || normalized === "1" || normalized === "yes") {
    return "true";
  }

  return "false";
}

export function buildAdminSettingsFormValues(
  settings: Setting[],
): AdminSettingsFormValues {
  const map = new Map(settings.map((setting) => [setting.settingKey, setting.settingValue]));

  return {
    adminContactPhone:
      map.get(ADMIN_SETTINGS_KEYS.adminContactPhone) ??
      ADMIN_SETTINGS_DEFAULT_VALUES.adminContactPhone,
    smsSenderPhoneDisplay:
      map.get(ADMIN_SETTINGS_KEYS.smsSenderPhoneDisplay) ??
      ADMIN_SETTINGS_DEFAULT_VALUES.smsSenderPhoneDisplay,
    autoSmsSendTime:
      map.get(ADMIN_SETTINGS_KEYS.autoSmsSendTime) ??
      ADMIN_SETTINGS_DEFAULT_VALUES.autoSmsSendTime,
    sitePublicEnabled: normalizeBooleanString(
      map.get(ADMIN_SETTINGS_KEYS.sitePublicEnabled),
    ),
    sponsorshipRequestEnabled: normalizeBooleanString(
      map.get(ADMIN_SETTINGS_KEYS.sponsorshipRequestEnabled),
    ),
    defaultSponsorshipAmount:
      map.get(ADMIN_SETTINGS_KEYS.defaultSponsorshipAmount) ??
      ADMIN_SETTINGS_DEFAULT_VALUES.defaultSponsorshipAmount,
    targetStudentCount:
      map.get(ADMIN_SETTINGS_KEYS.targetStudentCount) ??
      ADMIN_SETTINGS_DEFAULT_VALUES.targetStudentCount,
  };
}
