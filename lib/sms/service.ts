import { getSponsorshipById, getSponsorships } from "@/lib/repositories/sponsorships";
import { buildScholarshipViews } from "@/lib/repositories/scholarships";
import { getStudents } from "@/lib/repositories/students";
import { sendSms, SendSmsResult } from "./client";
import { getSmsTemplate, SmsTemplateName } from "./templates";

interface SponsorshipContext {
  sponsorshipId: string;
  sponsorName: string;
  sponsorPhone: string;
  sponsorshipType: string;
  sponsorshipPeriod: string;
  scholarshipAmount: number | null;
  studentPublicName: string;
}

function normalizePhoneNumber(value: string): string {
  return value.replace(/[^0-9]/g, "");
}

function getAdminNotificationPhone(): string {
  return normalizePhoneNumber(process.env.ADMIN_NOTIFICATION_PHONE?.trim() ?? "");
}

function resolveAmountLabel(
  sponsorshipType: string,
  scholarshipAmount: number | null,
): string {
  if (scholarshipAmount) {
    const amount = new Intl.NumberFormat("ko-KR").format(scholarshipAmount);
    return sponsorshipType === "정기후원" ? `월 ${amount}원` : `${amount}원`;
  }

  if (sponsorshipType === "정기후원") {
    return "월 100,000원";
  }

  return "100,000원";
}

function formatTodayForMessage(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function loadSponsorshipContext(
  sponsorshipId: string,
): Promise<SponsorshipContext> {
  const sponsorship = await getSponsorshipById(sponsorshipId);
  if (!sponsorship) {
    throw new Error(`[sms service] Sponsorship not found: ${sponsorshipId}`);
  }

  const students = await getStudents();
  const student = students.find((item) => item.id === sponsorship.studentId);
  if (!student) {
    throw new Error(
      `[sms service] Student not found for sponsorship: ${sponsorshipId}`,
    );
  }
  const scholarshipViews = await buildScholarshipViews(students);
  const scholarshipView = scholarshipViews.find(
    (item) => item.student.id === sponsorship.studentId,
  );

  return {
    sponsorshipId: sponsorship.id,
    sponsorName: sponsorship.sponsorName,
    sponsorPhone: sponsorship.sponsorPhone,
    sponsorshipType: sponsorship.sponsorshipType,
    sponsorshipPeriod: sponsorship.sponsorshipPeriod,
    scholarshipAmount: scholarshipView?.scholarshipAmount ?? null,
    studentPublicName: student.publicName,
  };
}

async function sendTemplateMessage(
  templateName: SmsTemplateName,
  to: string,
  variables: Record<string, string | number | boolean | null | undefined>,
): Promise<SendSmsResult> {
  const text = getSmsTemplate(templateName, variables);
  return sendSms(to, text, { templateName });
}

export async function sendSponsorshipReceivedSms(
  sponsorshipId: string,
): Promise<SendSmsResult> {
  const context = await loadSponsorshipContext(sponsorshipId);
  return sendTemplateMessage("sponsorship_received", context.sponsorPhone, {
    name: context.sponsorName,
    studentPublicName: context.studentPublicName,
    amount: resolveAmountLabel(context.sponsorshipType, context.scholarshipAmount),
    period: context.sponsorshipPeriod,
  });
}

export async function sendAdminNewSponsorshipSms(
  sponsorshipId: string,
): Promise<SendSmsResult> {
  const context = await loadSponsorshipContext(sponsorshipId);
  const adminPhone = getAdminNotificationPhone();
  return sendTemplateMessage("admin_new_sponsorship", adminPhone, {
    name: context.sponsorName,
    studentPublicName: context.studentPublicName,
    sponsorshipType: context.sponsorshipType,
    period: context.sponsorshipPeriod,
    phone: normalizePhoneNumber(context.sponsorPhone),
  });
}

export async function sendSponsorshipConfirmedSms(
  sponsorshipId: string,
): Promise<SendSmsResult> {
  const context = await loadSponsorshipContext(sponsorshipId);
  return sendTemplateMessage("sponsorship_confirmed", context.sponsorPhone, {
    name: context.sponsorName,
    studentPublicName: context.studentPublicName,
  });
}

export async function sendRecurringReminderSms(
  sponsorshipId: string,
): Promise<SendSmsResult> {
  const context = await loadSponsorshipContext(sponsorshipId);
  const contactPhone = getAdminNotificationPhone() || "관리자 연락처 미설정";
  return sendTemplateMessage("recurring_reminder", context.sponsorPhone, {
    name: context.sponsorName,
    studentPublicName: context.studentPublicName,
    amount: resolveAmountLabel(context.sponsorshipType, context.scholarshipAmount),
    contactPhone,
  });
}

export async function sendAdminDailyCallListSms(): Promise<SendSmsResult> {
  const [sponsorships, students] = await Promise.all([
    getSponsorships(),
    getStudents(),
  ]);
  const adminPhone = getAdminNotificationPhone();

  const studentById = new Map(students.map((student) => [student.id, student]));
  const pendingTargets = sponsorships.filter((item) => item.status === "입금대기");

  const itemsSummary =
    pendingTargets.length === 0
      ? "연락 대상 없음"
      : pendingTargets
          .slice(0, 6)
          .map((item) => {
            const publicName = studentById.get(item.studentId)?.publicName ?? item.studentId;
            return `${publicName}/${item.sponsorName}`;
          })
          .join(", ");

  return sendTemplateMessage("admin_daily_call_list", adminPhone, {
    date: formatTodayForMessage(),
    count: pendingTargets.length,
    items: itemsSummary,
  });
}
