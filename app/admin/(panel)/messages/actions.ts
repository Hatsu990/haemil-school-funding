"use server";

import { revalidatePath } from "next/cache";
import { sendSms } from "@/lib/sms/client";
import { getSmsTemplate, listSmsTemplates, SmsTemplateName } from "@/lib/sms/templates";

const TEMPLATE_NAME_SET = new Set<SmsTemplateName>(
  listSmsTemplates().map((template) => template.name),
);

export interface SendManualTemplateSmsActionResult {
  ok: boolean;
  message: string;
  responseMessage?: string;
}

function isTemplateName(value: string): value is SmsTemplateName {
  return TEMPLATE_NAME_SET.has(value as SmsTemplateName);
}

function extractFormString(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function sendManualTemplateSmsAction(
  formData: FormData,
): Promise<SendManualTemplateSmsActionResult> {
  const templateNameRaw = extractFormString(formData, "templateName");
  const phone = extractFormString(formData, "phone");

  if (!isTemplateName(templateNameRaw)) {
    return {
      ok: false,
      message: "문자 템플릿이 올바르지 않습니다.",
    };
  }

  if (!phone) {
    return {
      ok: false,
      message: "수신 전화번호를 입력해 주세요.",
    };
  }

  const variables = {
    name: extractFormString(formData, "name"),
    studentPublicName: extractFormString(formData, "studentPublicName"),
    amount: extractFormString(formData, "amount"),
    period: extractFormString(formData, "period"),
    sponsorshipType: extractFormString(formData, "sponsorshipType"),
    phone: extractFormString(formData, "templatePhone"),
    contactPhone: extractFormString(formData, "contactPhone"),
    date: extractFormString(formData, "date"),
    count: extractFormString(formData, "count"),
    items: extractFormString(formData, "items"),
  };

  const text = getSmsTemplate(templateNameRaw, variables);
  const result = await sendSms(phone, text, {
    templateName: templateNameRaw,
  });

  revalidatePath("/admin/messages");

  if (result.ok) {
    return {
      ok: true,
      message: "문자가 발송되었습니다.",
      responseMessage: result.responseMessage,
    };
  }

  if (result.skipped) {
    return {
      ok: false,
      message:
        "실제 문자는 발송되지 않았습니다. 개발 모드 콘솔 출력 및 발송 이력 저장만 수행했습니다.",
      responseMessage: result.responseMessage,
    };
  }

  return {
    ok: false,
    message: "문자 발송에 실패했습니다. 발송 이력을 확인해 주세요.",
    responseMessage: result.responseMessage,
  };
}
