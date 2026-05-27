import { Setting } from "@/types";

export const ADMIN_SETTINGS_KEYS = {
  representativeContactPhone: "representative_contact_phone",
  sponsorshipContactPhone: "sponsorship_contact_phone",
  smsSenderPhoneDisplay: "sms_sender_phone_display",
  autoSmsSendTime: "auto_sms_send_time",
} as const;

export interface AdminSettingsFormValues {
  representativeContactPhone: string;
  sponsorshipContactPhone: string;
  smsSenderPhoneDisplay: string;
  autoSmsSendTime: string;
}

export const ADMIN_SETTINGS_DEFAULT_VALUES: AdminSettingsFormValues = {
  representativeContactPhone: "033-830-8761",
  sponsorshipContactPhone: "010-9423-8761",
  smsSenderPhoneDisplay: "010-0000-0000",
  autoSmsSendTime: "19:00",
};

export function buildAdminSettingsFormValues(
  settings: Setting[],
): AdminSettingsFormValues {
  const map = new Map(settings.map((setting) => [setting.settingKey, setting.settingValue]));

  return {
    representativeContactPhone:
      map.get(ADMIN_SETTINGS_KEYS.representativeContactPhone) ??
      ADMIN_SETTINGS_DEFAULT_VALUES.representativeContactPhone,
    sponsorshipContactPhone:
      map.get(ADMIN_SETTINGS_KEYS.sponsorshipContactPhone) ??
      ADMIN_SETTINGS_DEFAULT_VALUES.sponsorshipContactPhone,
    smsSenderPhoneDisplay:
      map.get(ADMIN_SETTINGS_KEYS.smsSenderPhoneDisplay) ??
      ADMIN_SETTINGS_DEFAULT_VALUES.smsSenderPhoneDisplay,
    autoSmsSendTime:
      map.get(ADMIN_SETTINGS_KEYS.autoSmsSendTime) ??
      ADMIN_SETTINGS_DEFAULT_VALUES.autoSmsSendTime,
  };
}
