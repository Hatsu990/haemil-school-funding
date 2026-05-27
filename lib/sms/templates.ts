export type SmsTemplateName =
  | "sponsorship_received"
  | "admin_new_sponsorship"
  | "sponsorship_confirmed"
  | "recurring_reminder"
  | "admin_daily_call_list";

type SmsTemplateVariables = Record<
  string,
  string | number | boolean | null | undefined
>;

interface SmsTemplateDefinition {
  title: string;
  body: string;
  manualFields: Array<{
    name: string;
    label: string;
    placeholder: string;
  }>;
}

const SMS_TEMPLATES: Record<SmsTemplateName, SmsTemplateDefinition> = {
  sponsorship_received: {
    title: "후원 신청 접수 안내",
    body: "{{name}}님, 후원 신청이 접수되었습니다. 관리자 확인 후 연락드리겠습니다.",
    manualFields: [
      {
        name: "name",
        label: "후원자 이름",
        placeholder: "후원자 이름",
      },
    ],
  },
  admin_new_sponsorship: {
    title: "관리자 새 후원 신청 알림",
    body: "[해밀학교] 새 후원 신청: 후원자 {{name}}, 학생 {{studentPublicName}}, 방식 {{sponsorshipType}}, 기간 {{period}}, 연락처 {{phone}}",
    manualFields: [
      { name: "name", label: "후원자 이름", placeholder: "후원자 이름" },
      { name: "studentPublicName", label: "학생 이름", placeholder: "학생 이름" },
      { name: "sponsorshipType", label: "결연 방식", placeholder: "3년 결연" },
      { name: "period", label: "기간", placeholder: "3년" },
      { name: "templatePhone", label: "연락처", placeholder: "01012345678" },
    ],
  },
  sponsorship_confirmed: {
    title: "입금 완료 및 결연 완료 안내",
    body: "{{name}}님, {{studentPublicName}} 학생 후원금 입금이 확인되어 결연이 완료되었습니다. 함께해 주셔서 감사합니다.",
    manualFields: [
      { name: "name", label: "후원자 이름", placeholder: "후원자 이름" },
      { name: "studentPublicName", label: "학생 이름", placeholder: "학생 이름" },
    ],
  },
  recurring_reminder: {
    title: "3년 결연 안내",
    body: "{{name}}님, {{studentPublicName}} 학생 3년 결연 안내입니다. 이번 장학금은 {{amount}}입니다. 문의 {{contactPhone}}",
    manualFields: [
      { name: "name", label: "후원자 이름", placeholder: "후원자 이름" },
      { name: "studentPublicName", label: "학생 이름", placeholder: "학생 이름" },
      { name: "amount", label: "금액", placeholder: "월 100,000원" },
      { name: "contactPhone", label: "문의 연락처", placeholder: "01012345678" },
    ],
  },
  admin_daily_call_list: {
    title: "관리자 일일 연락 대상 안내",
    body: "[해밀학교] {{date}} 연락 대상 {{count}}건: {{items}}",
    manualFields: [
      { name: "date", label: "날짜", placeholder: "2026-05-27" },
      { name: "count", label: "건수", placeholder: "3" },
      { name: "items", label: "대상 목록", placeholder: "학생/후원자 목록" },
    ],
  },
};

function sanitizeVariableValue(value: SmsTemplateVariables[string]): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function renderTemplateBody(
  body: string,
  variables: SmsTemplateVariables,
): string {
  return body.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, key) => {
    return sanitizeVariableValue(variables[key]);
  });
}

export function getSmsTemplate(
  templateName: SmsTemplateName,
  variables: SmsTemplateVariables = {},
): string {
  const template = SMS_TEMPLATES[templateName];
  if (!template) {
    throw new Error(`[sms templates] Unknown template name: ${templateName}`);
  }

  return renderTemplateBody(template.body, variables);
}

export function listSmsTemplates(): Array<{
  name: SmsTemplateName;
  title: string;
  body: string;
  manualFields: SmsTemplateDefinition["manualFields"];
}> {
  return (Object.keys(SMS_TEMPLATES) as SmsTemplateName[]).map((name) => ({
    name,
    title: SMS_TEMPLATES[name].title,
    body: SMS_TEMPLATES[name].body,
    manualFields: SMS_TEMPLATES[name].manualFields,
  }));
}
