export type IsoDateTimeString = string;

export type StudentSponsorshipStatus = "available" | "pending" | "matched";

export type StudentGender = "\uB0A8" | "\uC5EC";

export type SponsorshipKind =
  | "\uC77C\uC2DC\uD6C4\uC6D0"
  | "\uC815\uAE30\uD6C4\uC6D0";

export type SponsorshipProgressStatus =
  | "\uC785\uAE08\uB300\uAE30"
  | "\uC785\uAE08\uC644\uB8CC"
  | "\uCDE8\uC18C";

export type GalleryItemType = "image" | "video";

export type SmsDeliveryStatus =
  | "\uC131\uACF5"
  | "\uC2E4\uD328"
  | "\uB300\uAE30";

export type ScholarshipType =
  | "\uC804\uC561\uC7A5\uD559\uAE08"
  | "\uBC18\uC561\uC7A5\uD559\uAE08"
  | "\uBD80\uBD84\uC7A5\uD559\uAE08";

export interface StudentProfile {
  id: string;
  nickname: string;
  realName?: string | null;
  gender: StudentGender;
  grade: string;
  description: string;
  profileImageUrl?: string | null;
  letterImageUrl?: string | null;
  sponsorshipStatus: StudentSponsorshipStatus;
  createdAt?: IsoDateTimeString;
  updatedAt?: IsoDateTimeString;
  // Mock UI compatibility fields (to be removed after DB data wiring).
  profileTheme?: string;
  letterSummary?: string;
}

export interface SponsorshipRecord {
  id: string;
  studentId: string;
  sponsorName: string;
  sponsorPhone: string;
  sponsorEmail: string;
  sponsorshipType: SponsorshipKind;
  sponsorshipPeriod: string;
  sponsorPublic: boolean;
  sponsorMessage: string | null;
  receiptRequested: boolean;
  status: SponsorshipProgressStatus;
  createdAt: IsoDateTimeString;
  updatedAt?: IsoDateTimeString;
}

export interface GalleryItem {
  id: string;
  title: string;
  type: GalleryItemType;
  fileUrl?: string;
  createdAt: IsoDateTimeString;
  // Mock UI compatibility field (to be removed after DB data wiring).
  fileLabel?: string;
}

export interface SmsLog {
  id: string;
  phone: string;
  templateName: string;
  status: SmsDeliveryStatus;
  responseMessage: string | null;
  createdAt: IsoDateTimeString;
}

export interface Setting {
  id: string;
  settingKey: string;
  settingValue: string;
  updatedAt: IsoDateTimeString;
}

export interface StudentRow {
  id: string;
  nickname: string;
  real_name: string | null;
  gender: StudentGender;
  grade: string;
  description: string;
  profile_image_url: string | null;
  letter_image_url: string | null;
  sponsorship_status: StudentSponsorshipStatus;
  created_at: IsoDateTimeString;
  updated_at: IsoDateTimeString;
}

export interface SponsorshipRow {
  id: string;
  student_id: string;
  sponsor_name: string;
  sponsor_phone: string;
  sponsor_email: string;
  sponsorship_type: SponsorshipKind;
  sponsorship_period: string;
  sponsor_public: 0 | 1;
  sponsor_message: string | null;
  receipt_requested: 0 | 1;
  status: SponsorshipProgressStatus;
  created_at: IsoDateTimeString;
  updated_at: IsoDateTimeString;
}

export interface GalleryItemRow {
  id: string;
  title: string;
  type: GalleryItemType;
  file_url: string;
  created_at: IsoDateTimeString;
}

export interface SmsLogRow {
  id: string;
  phone: string;
  template_name: string;
  status: SmsDeliveryStatus;
  response_message: string | null;
  created_at: IsoDateTimeString;
}

export interface SettingRow {
  id: string;
  setting_key: string;
  setting_value: string;
  updated_at: IsoDateTimeString;
}

export interface StudentScholarshipRecord {
  id: string;
  studentId: string;
  scholarshipType: ScholarshipType;
  studentName: string;
  studentPhone: string;
  parentName: string;
  parentPhone: string;
  bankAccount: string;
  residentRegistrationFileUrl: string | null;
  bankbookFileUrl: string | null;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}

export interface StudentScholarshipRecordRow {
  id: string;
  student_id: string;
  scholarship_type: ScholarshipType;
  student_name: string;
  student_phone: string;
  parent_name: string;
  parent_phone: string;
  bank_account: string;
  resident_registration_file_url: string | null;
  bankbook_file_url: string | null;
  created_at: IsoDateTimeString;
  updated_at: IsoDateTimeString;
}

export interface StudentScholarshipView {
  student: StudentProfile;
  scholarshipType: ScholarshipType;
  scholarshipAmount: number;
  record: StudentScholarshipRecord | null;
}

export interface UpdateStudentStatusInput {
  id: string;
  sponsorshipStatus: StudentSponsorshipStatus;
}

export interface CreateStudentInput {
  nickname: string;
  realName?: string | null;
  gender: StudentGender;
  grade: string;
  description: string;
  sponsorshipStatus?: StudentSponsorshipStatus;
}

export interface UpdateStudentProfileInput {
  id: string;
  nickname: string;
  realName?: string | null;
  gender: StudentGender;
  grade: string;
  description: string;
}

export interface CreateSponsorshipInput {
  studentId: string;
  sponsorName: string;
  sponsorPhone: string;
  sponsorEmail: string;
  sponsorshipType: SponsorshipKind;
  sponsorshipPeriod: string;
  sponsorPublic: boolean;
  sponsorMessage: string | null;
  receiptRequested: boolean;
}

export interface UpdateSponsorshipStatusInput {
  id: string;
  status: SponsorshipProgressStatus;
}

export interface CreateGalleryItemInput {
  title: string;
  type: GalleryItemType;
  fileUrl: string;
}

export interface CreateSmsLogInput {
  phone: string;
  templateName: string;
  status: SmsDeliveryStatus;
  responseMessage: string | null;
}
