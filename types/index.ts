export type StudentSponsorshipStatus = "available" | "pending" | "matched";

export type SponsorshipKind = "일시후원" | "정기후원";

export type SponsorshipProgressStatus = "입금대기" | "입금완료" | "취소";

export type GalleryItemType = "image" | "video";

export interface StudentProfile {
  id: string;
  nickname: string;
  gender: "남" | "여";
  grade: string;
  description: string;
  profileTheme: string;
  letterSummary: string;
  sponsorshipStatus: StudentSponsorshipStatus;
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
  sponsorMessage: string;
  receiptRequested: boolean;
  status: SponsorshipProgressStatus;
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  type: GalleryItemType;
  fileLabel: string;
  createdAt: string;
}

export interface SmsLog {
  id: string;
  phone: string;
  templateName: string;
  status: "성공" | "실패" | "대기";
  responseMessage: string;
  createdAt: string;
}
