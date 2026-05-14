import { randomUUID } from "node:crypto";
import { DbTransaction, getDbClient } from "@/lib/db/client";
import {
  CreateSmsLogInput,
  SmsLog,
  SmsLogRow,
  SponsorshipProgressStatus,
} from "@/types";

function mapSmsRow(row: SmsLogRow): SmsLog {
  return {
    id: row.id,
    phone: row.phone,
    templateName: row.template_name,
    status: row.status,
    responseMessage: row.response_message,
    createdAt: row.created_at,
  };
}

function makeSmsId(): string {
  return `sms-${randomUUID()}`;
}

type SmsWriteExecutor = Pick<DbTransaction, "execute">;

function makeStatusChangeLogTemplateName(): string {
  return "sponsorship_status_change";
}

export interface CreateStatusChangeLogInput {
  sponsorshipId: string;
  studentId: string;
  previousStatus: SponsorshipProgressStatus;
  nextStatus: SponsorshipProgressStatus;
  actor?: string;
  note?: string;
}

export async function getSmsLogs(): Promise<SmsLog[]> {
  const db = await getDbClient();
  const result = await db.execute<SmsLogRow>(
    `
      SELECT
        id,
        phone,
        template_name,
        status,
        response_message,
        created_at
      FROM sms_logs
      ORDER BY created_at DESC, id DESC
    `,
  );

  return result.rows.map((row) => mapSmsRow(row));
}

export async function createSmsLog(data: CreateSmsLogInput): Promise<SmsLog> {
  const db = await getDbClient();
  const smsId = makeSmsId();

  await db.execute(
    `
      INSERT INTO sms_logs (
        id,
        phone,
        template_name,
        status,
        response_message,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `,
    [smsId, data.phone, data.templateName, data.status, data.responseMessage],
  );

  const result = await db.execute<SmsLogRow>(
    `
      SELECT
        id,
        phone,
        template_name,
        status,
        response_message,
        created_at
      FROM sms_logs
      WHERE id = ?
      LIMIT 1
    `,
    [smsId],
  );

  if (result.rows.length === 0) {
    throw new Error(`[sms repository] Failed to load created sms log: ${smsId}`);
  }

  return mapSmsRow(result.rows[0]);
}

export async function createStatusChangeLog(
  data: CreateStatusChangeLogInput,
  executor?: SmsWriteExecutor,
): Promise<void> {
  const writer = executor ?? (await getDbClient());
  const logId = `audit-${randomUUID()}`;
  const payload = JSON.stringify({
    sponsorshipId: data.sponsorshipId,
    studentId: data.studentId,
    previousStatus: data.previousStatus,
    nextStatus: data.nextStatus,
    actor: data.actor ?? "admin",
    note: data.note ?? null,
  });

  await writer.execute(
    `
      INSERT INTO sms_logs (
        id,
        phone,
        template_name,
        status,
        response_message,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `,
    [logId, "-", makeStatusChangeLogTemplateName(), "성공", payload],
  );
}
