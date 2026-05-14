import { SolapiMessageService } from "solapi";
import { createSmsLog } from "@/lib/repositories/sms";
import { SmsDeliveryStatus } from "@/types";
import { SmsTemplateName } from "./templates";

const PHONE_NUMBER_PATTERN = /^\d{8,15}$/;

interface SolapiConfig {
  apiKey: string;
  apiSecret: string;
  senderPhone: string;
}

export interface SmsClientStatus {
  configured: boolean;
  missingEnvKeys: string[];
}

export interface SendSmsOptions {
  templateName?: SmsTemplateName | string;
}

export interface SendSmsResult {
  ok: boolean;
  status: SmsDeliveryStatus;
  skipped: boolean;
  to: string;
  responseMessage: string;
}

function normalizePhoneNumber(value: string): string {
  return value.replace(/[^0-9]/g, "");
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function compactMessage(text: string, max = 200): string {
  if (text.length <= max) {
    return text;
  }

  return `${text.slice(0, max)}...`;
}

function getSolapiConfig(): SolapiConfig | null {
  const apiKey = process.env.SOLAPI_API_KEY?.trim() ?? "";
  const apiSecret = process.env.SOLAPI_API_SECRET?.trim() ?? "";
  const senderPhoneRaw = process.env.SOLAPI_SENDER_PHONE?.trim() ?? "";
  const senderPhone = normalizePhoneNumber(senderPhoneRaw);

  if (!apiKey || !apiSecret || !senderPhone) {
    return null;
  }

  return {
    apiKey,
    apiSecret,
    senderPhone,
  };
}

export function getSmsClientStatus(): SmsClientStatus {
  const missingEnvKeys: string[] = [];

  if (!process.env.SOLAPI_API_KEY?.trim()) {
    missingEnvKeys.push("SOLAPI_API_KEY");
  }

  if (!process.env.SOLAPI_API_SECRET?.trim()) {
    missingEnvKeys.push("SOLAPI_API_SECRET");
  }

  const senderPhone = normalizePhoneNumber(process.env.SOLAPI_SENDER_PHONE ?? "");
  if (!senderPhone) {
    missingEnvKeys.push("SOLAPI_SENDER_PHONE");
  }

  return {
    configured: missingEnvKeys.length === 0,
    missingEnvKeys,
  };
}

async function persistSmsLog(
  phone: string,
  templateName: string,
  status: SmsDeliveryStatus,
  responseMessage: string,
): Promise<void> {
  try {
    await createSmsLog({
      phone,
      templateName,
      status,
      responseMessage,
    });
  } catch (error) {
    console.error("[sms client] failed to save sms log", error);
  }
}

function parseProviderResponseMessage(response: unknown): string {
  if (!response || typeof response !== "object") {
    return "메시지 발송 성공";
  }

  const responseRecord = response as Record<string, unknown>;
  const groupInfo =
    responseRecord.groupInfo && typeof responseRecord.groupInfo === "object"
      ? (responseRecord.groupInfo as Record<string, unknown>)
      : null;

  const groupId =
    (groupInfo?.groupId as string | undefined) ??
    (groupInfo?.group_id as string | undefined);
  const totalCount =
    (groupInfo?.count as Record<string, unknown> | undefined)?.total ??
    (groupInfo?.count as Record<string, unknown> | undefined)?.registeredSuccess;

  if (groupId) {
    return totalCount
      ? `groupId=${groupId}, count=${String(totalCount)}`
      : `groupId=${groupId}`;
  }

  try {
    return compactMessage(JSON.stringify(response));
  } catch {
    return "메시지 발송 성공";
  }
}

function buildMissingConfigMessage(missingKeys: string[]): string {
  return `[sms skipped] Solapi 환경변수가 없어 발송하지 않았습니다: ${missingKeys.join(", ")}`;
}

export async function sendSms(
  to: string,
  text: string,
  options: SendSmsOptions = {},
): Promise<SendSmsResult> {
  const templateName = options.templateName ?? "manual";
  const normalizedTo = normalizePhoneNumber(to);
  const logPhone = normalizedTo || to.trim() || "-";

  if (!PHONE_NUMBER_PATTERN.test(normalizedTo)) {
    const responseMessage = `[sms validation] 수신번호 형식이 올바르지 않습니다: ${to}`;
    await persistSmsLog(logPhone, templateName, "실패", responseMessage);
    return {
      ok: false,
      status: "실패",
      skipped: true,
      to: logPhone,
      responseMessage,
    };
  }

  const clientStatus = getSmsClientStatus();
  if (!clientStatus.configured) {
    const responseMessage = buildMissingConfigMessage(clientStatus.missingEnvKeys);
    if (process.env.NODE_ENV !== "production") {
      console.info("[sms dev fallback]", {
        to: normalizedTo,
        templateName,
        text,
        reason: responseMessage,
      });
    }

    await persistSmsLog(normalizedTo, templateName, "실패", responseMessage);
    return {
      ok: false,
      status: "실패",
      skipped: true,
      to: normalizedTo,
      responseMessage,
    };
  }

  const solapiConfig = getSolapiConfig();
  if (!solapiConfig) {
    const responseMessage = buildMissingConfigMessage(clientStatus.missingEnvKeys);
    await persistSmsLog(normalizedTo, templateName, "실패", responseMessage);
    return {
      ok: false,
      status: "실패",
      skipped: true,
      to: normalizedTo,
      responseMessage,
    };
  }

  try {
    const messageService = new SolapiMessageService(
      solapiConfig.apiKey,
      solapiConfig.apiSecret,
    );
    const response = await messageService.send({
      to: normalizedTo,
      from: solapiConfig.senderPhone,
      text,
    });

    const responseMessage = parseProviderResponseMessage(response);
    await persistSmsLog(normalizedTo, templateName, "성공", responseMessage);
    return {
      ok: true,
      status: "성공",
      skipped: false,
      to: normalizedTo,
      responseMessage,
    };
  } catch (error) {
    const responseMessage = `[sms send error] ${extractErrorMessage(error)}`;
    await persistSmsLog(normalizedTo, templateName, "실패", responseMessage);
    return {
      ok: false,
      status: "실패",
      skipped: false,
      to: normalizedTo,
      responseMessage,
    };
  }
}
