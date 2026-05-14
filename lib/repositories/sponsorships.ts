import { randomUUID } from "node:crypto";
import { getDbClient } from "@/lib/db/client";
import { createStatusChangeLog } from "@/lib/repositories/sms";
import {
  CreateSponsorshipInput,
  SponsorshipProgressStatus,
  SponsorshipRecord,
  SponsorshipRow,
  StudentSponsorshipStatus,
  UpdateSponsorshipStatusInput,
} from "@/types";

const STUDENT_BLOCKED_ERROR_PREFIX =
  "[sponsorships repository] Student is not available:";
const STUDENT_NOT_FOUND_ERROR_PREFIX =
  "[sponsorships repository] Student not found:";
const INVALID_SPONSORSHIP_STATUS_ERROR_PREFIX =
  "[sponsorships repository] Invalid sponsorship status:";

const SPONSORSHIP_STATUS_SET = new Set<SponsorshipProgressStatus>([
  "입금대기",
  "입금완료",
  "취소",
]);

function mapSponsorshipRow(row: SponsorshipRow): SponsorshipRecord {
  return {
    id: row.id,
    studentId: row.student_id,
    sponsorName: row.sponsor_name,
    sponsorPhone: row.sponsor_phone,
    sponsorEmail: row.sponsor_email,
    sponsorshipType: row.sponsorship_type,
    sponsorshipPeriod: row.sponsorship_period,
    sponsorPublic: row.sponsor_public === 1,
    sponsorMessage: row.sponsor_message,
    receiptRequested: row.receipt_requested === 1,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function makeSponsorshipId(): string {
  return `sp-${randomUUID()}`;
}

function isSponsorshipProgressStatus(
  value: string,
): value is SponsorshipProgressStatus {
  return SPONSORSHIP_STATUS_SET.has(value as SponsorshipProgressStatus);
}

function toStudentStatusFromSponsorshipStatus(
  status: SponsorshipProgressStatus,
): StudentSponsorshipStatus {
  if (status === "입금완료") {
    return "matched";
  }

  if (status === "취소") {
    return "available";
  }

  return "pending";
}

function buildStudentBlockedError(status: StudentSponsorshipStatus): Error {
  return new Error(`${STUDENT_BLOCKED_ERROR_PREFIX}${status}`);
}

function buildStudentNotFoundError(studentId: string): Error {
  return new Error(`${STUDENT_NOT_FOUND_ERROR_PREFIX}${studentId}`);
}

export function getBlockedStudentStatusFromSponsorshipError(
  error: unknown,
): StudentSponsorshipStatus | null {
  const message = error instanceof Error ? error.message : String(error);
  if (!message.startsWith(STUDENT_BLOCKED_ERROR_PREFIX)) {
    return null;
  }

  const status = message
    .slice(STUDENT_BLOCKED_ERROR_PREFIX.length)
    .trim() as StudentSponsorshipStatus;

  if (status === "available" || status === "pending" || status === "matched") {
    return status;
  }

  return null;
}

export function isStudentNotFoundSponsorshipError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.startsWith(STUDENT_NOT_FOUND_ERROR_PREFIX);
}

export function isInvalidSponsorshipStatusError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.startsWith(INVALID_SPONSORSHIP_STATUS_ERROR_PREFIX);
}

export async function getSponsorships(): Promise<SponsorshipRecord[]> {
  const db = await getDbClient();
  const result = await db.execute<SponsorshipRow>(
    `
      SELECT
        id,
        student_id,
        sponsor_name,
        sponsor_phone,
        sponsor_email,
        sponsorship_type,
        sponsorship_period,
        sponsor_public,
        sponsor_message,
        receipt_requested,
        status,
        created_at,
        updated_at
      FROM sponsorships
      ORDER BY created_at DESC, id DESC
    `,
  );

  return result.rows.map((row) => mapSponsorshipRow(row));
}

export async function getSponsorshipById(
  id: string,
): Promise<SponsorshipRecord | null> {
  const db = await getDbClient();
  const result = await db.execute<SponsorshipRow>(
    `
      SELECT
        id,
        student_id,
        sponsor_name,
        sponsor_phone,
        sponsor_email,
        sponsorship_type,
        sponsorship_period,
        sponsor_public,
        sponsor_message,
        receipt_requested,
        status,
        created_at,
        updated_at
      FROM sponsorships
      WHERE id = ?
      LIMIT 1
    `,
    [id],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapSponsorshipRow(result.rows[0]);
}

export async function createSponsorship(
  data: CreateSponsorshipInput,
): Promise<SponsorshipRecord> {
  const db = await getDbClient();
  const sponsorshipId = makeSponsorshipId();
  const sponsorMessage = data.sponsorMessage?.trim() || null;

  await db.transaction(async (tx) => {
    const studentResult = await tx.execute<{
      id: string;
      sponsorship_status: StudentSponsorshipStatus;
    }>(
      `
        SELECT id, sponsorship_status
        FROM students
        WHERE id = ?
        LIMIT 1
      `,
      [data.studentId],
    );

    if (studentResult.rows.length === 0) {
      throw buildStudentNotFoundError(data.studentId);
    }

    const student = studentResult.rows[0];
    if (student.sponsorship_status !== "available") {
      throw buildStudentBlockedError(student.sponsorship_status);
    }

    await tx.execute(
      `
        INSERT INTO sponsorships (
          id,
          student_id,
          sponsor_name,
          sponsor_phone,
          sponsor_email,
          sponsorship_type,
          sponsorship_period,
          sponsor_public,
          sponsor_message,
          receipt_requested,
          status,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '입금대기', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
      [
        sponsorshipId,
        data.studentId,
        data.sponsorName,
        data.sponsorPhone,
        data.sponsorEmail,
        data.sponsorshipType,
        data.sponsorshipPeriod,
        data.sponsorPublic ? 1 : 0,
        sponsorMessage,
        data.receiptRequested ? 1 : 0,
      ],
    );

    const updateStudentResult = await tx.execute(
      `
        UPDATE students
        SET sponsorship_status = 'pending', updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND sponsorship_status = 'available'
      `,
      [data.studentId],
    );

    if (updateStudentResult.rowsAffected === 0) {
      throw buildStudentBlockedError("pending");
    }
  });

  const created = await getSponsorshipById(sponsorshipId);
  if (!created) {
    throw new Error(
      `[sponsorships repository] Failed to load created sponsorship: ${sponsorshipId}`,
    );
  }

  return created;
}

export async function updateSponsorshipStatus(
  id: string,
  status: SponsorshipProgressStatus,
): Promise<void> {
  if (!isSponsorshipProgressStatus(status)) {
    throw new Error(`${INVALID_SPONSORSHIP_STATUS_ERROR_PREFIX}${status}`);
  }

  const db = await getDbClient();
  await db.transaction(async (tx) => {
    const currentSponsorshipResult = await tx.execute<{
      id: string;
      student_id: string;
      status: SponsorshipProgressStatus;
    }>(
      `
        SELECT id, student_id, status
        FROM sponsorships
        WHERE id = ?
        LIMIT 1
      `,
      [id],
    );

    if (currentSponsorshipResult.rows.length === 0) {
      throw new Error(`[sponsorships repository] Sponsorship not found: ${id}`);
    }

    const current = currentSponsorshipResult.rows[0];
    const nextStudentStatus = toStudentStatusFromSponsorshipStatus(status);

    const updateSponsorshipResult = await tx.execute(
      `
        UPDATE sponsorships
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [status, id],
    );

    if (updateSponsorshipResult.rowsAffected === 0) {
      throw new Error(`[sponsorships repository] Sponsorship not found: ${id}`);
    }

    const updateStudentResult = await tx.execute(
      `
        UPDATE students
        SET sponsorship_status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [nextStudentStatus, current.student_id],
    );

    if (updateStudentResult.rowsAffected === 0) {
      throw buildStudentNotFoundError(current.student_id);
    }

    try {
      await createStatusChangeLog(
        {
          sponsorshipId: id,
          studentId: current.student_id,
          previousStatus: current.status,
          nextStatus: status,
          actor: "admin",
        },
        tx,
      );
    } catch (error) {
      console.error(
        "[sponsorships repository] failed to write status change log",
        error,
      );
    }
  });
}

export async function updateSponsorshipStatusByInput(
  input: UpdateSponsorshipStatusInput,
): Promise<void> {
  return updateSponsorshipStatus(input.id, input.status);
}
