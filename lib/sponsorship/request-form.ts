import { SponsorshipKind } from "@/types";

const ONE_TIME_TYPE = "일시후원";
const REGULAR_TYPE = "정기후원";

export const DIRECT_PERIOD_OPTION = "직접입력";
export const THREE_YEAR_SPONSORSHIP_PERIOD = "3년";
export type SponsorshipPeriodOption =
  | typeof THREE_YEAR_SPONSORSHIP_PERIOD
  | typeof DIRECT_PERIOD_OPTION
  | "";

export type SponsorPublicOption = "public" | "private";
export type SponsorshipTypeOption = SponsorshipKind | "";

export interface SponsorshipRequestValues {
  studentId: string;
  sponsorName: string;
  sponsorPhone: string;
  sponsorEmail: string;
  sponsorshipType: SponsorshipTypeOption;
  sponsorshipPeriodOption: SponsorshipPeriodOption;
  sponsorshipPeriodCustom: string;
  sponsorPublic: SponsorPublicOption;
  sponsorMessage: string;
  receiptRequested: boolean;
  privacyConsent: boolean;
}

export type SponsorshipRequestField =
  | "sponsorName"
  | "sponsorPhone"
  | "sponsorEmail"
  | "sponsorshipType"
  | "sponsorshipPeriodOption"
  | "sponsorshipPeriodCustom"
  | "privacyConsent"
  | "studentId";

export type SponsorshipRequestErrors = Partial<
  Record<SponsorshipRequestField, string>
>;

export interface SponsorshipRequestState {
  formError: string | null;
  fieldErrors: SponsorshipRequestErrors;
  values: SponsorshipRequestValues;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_PATTERN = /^01[0-9]-?\d{3,4}-?\d{4}$/;

export const initialSponsorshipRequestValues: SponsorshipRequestValues = {
  studentId: "",
  sponsorName: "",
  sponsorPhone: "",
  sponsorEmail: "",
  sponsorshipType: "",
  sponsorshipPeriodOption: "",
  sponsorshipPeriodCustom: "",
  sponsorPublic: "public",
  sponsorMessage: "",
  receiptRequested: false,
  privacyConsent: false,
};

export const initialSponsorshipRequestState: SponsorshipRequestState = {
  formError: null,
  fieldErrors: {},
  values: initialSponsorshipRequestValues,
};

export function extractSponsorshipRequestValues(
  formData: FormData,
): SponsorshipRequestValues {
  const sponsorshipTypeRaw = String(formData.get("sponsorshipType") ?? "").trim();
  const sponsorshipType: SponsorshipTypeOption =
    sponsorshipTypeRaw === REGULAR_TYPE ? sponsorshipTypeRaw : "";

  const sponsorPublicRaw = String(formData.get("sponsorPublic") ?? "").trim();
  const sponsorPublic: SponsorPublicOption =
    sponsorPublicRaw === "private" ? "private" : "public";

  return {
    studentId: String(formData.get("studentId") ?? "").trim(),
    sponsorName: String(formData.get("sponsorName") ?? "").trim(),
    sponsorPhone: String(formData.get("sponsorPhone") ?? "").trim(),
    sponsorEmail: String(formData.get("sponsorEmail") ?? "").trim(),
    sponsorshipType,
    sponsorshipPeriodOption: THREE_YEAR_SPONSORSHIP_PERIOD,
    sponsorshipPeriodCustom: String(
      formData.get("sponsorshipPeriodCustom") ?? "",
    ).trim(),
    sponsorPublic,
    sponsorMessage: String(formData.get("sponsorMessage") ?? "").trim(),
    receiptRequested: formData.get("receiptRequested") === "on",
    privacyConsent: formData.get("privacyConsent") === "on",
  };
}

export function validateSponsorshipRequestValues(
  values: SponsorshipRequestValues,
): SponsorshipRequestErrors {
  const errors: SponsorshipRequestErrors = {};

  if (!values.studentId) {
    errors.studentId = "학생 정보가 누락되었습니다. 다시 선택해 주세요.";
  }

  if (!values.sponsorName) {
    errors.sponsorName = "후원자 이름을 입력해 주세요.";
  }

  if (!values.sponsorPhone) {
    errors.sponsorPhone = "휴대폰 번호를 입력해 주세요.";
  } else if (!MOBILE_PATTERN.test(values.sponsorPhone)) {
    errors.sponsorPhone = "휴대폰 번호 형식이 올바르지 않습니다.";
  }

  if (!values.sponsorEmail) {
    errors.sponsorEmail = "이메일을 입력해 주세요.";
  } else if (!EMAIL_PATTERN.test(values.sponsorEmail)) {
    errors.sponsorEmail = "이메일 형식이 올바르지 않습니다.";
  }

  if (!values.sponsorshipType) {
    errors.sponsorshipType = "결연 방식 정보가 누락되었습니다.";
  }

  if (values.sponsorshipType === REGULAR_TYPE) {
    if (!values.sponsorshipPeriodOption) {
      errors.sponsorshipPeriodOption = "3년 결연 기간 정보가 누락되었습니다.";
    } else if (
      values.sponsorshipPeriodOption === DIRECT_PERIOD_OPTION &&
      !values.sponsorshipPeriodCustom
    ) {
      errors.sponsorshipPeriodCustom = "직접 입력 기간을 입력해 주세요.";
    }
  }

  if (!values.privacyConsent) {
    errors.privacyConsent = "개인정보 수집 및 이용 동의는 필수입니다.";
  }

  return errors;
}

export function resolveSponsorshipPeriod(values: SponsorshipRequestValues): string {
  if (values.sponsorshipType === ONE_TIME_TYPE) {
    return "1회";
  }

  if (values.sponsorshipPeriodOption === DIRECT_PERIOD_OPTION) {
    return values.sponsorshipPeriodCustom;
  }

  return values.sponsorshipPeriodOption;
}
