import { randomUUID } from "node:crypto";
import { getDbClient } from "@/lib/db/client";
import { resolveStudentProfileImageUrl } from "@/lib/students/profile-images";
import {
  CreateStudentInput,
  StudentProfile,
  StudentRow,
  StudentSponsorshipStatus,
  UpdateStudentStatusInput,
} from "@/types";

const STUDENT_NOT_FOUND_ERROR_PREFIX = "[students repository] Student not found:";
const STUDENT_DELETE_BLOCKED_ERROR_PREFIX =
  "[students repository] Student delete blocked by sponsorship:";

function makeStudentId(): string {
  return `st-${randomUUID()}`;
}

function mapStudentRow(row: StudentRow): StudentProfile {
  return {
    id: row.id,
    nickname: row.nickname,
    gender: row.gender,
    grade: row.grade,
    description: row.description,
    profileImageUrl: row.profile_image_url,
    letterImageUrl: row.letter_image_url,
    sponsorshipStatus: row.sponsorship_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getStudents(): Promise<StudentProfile[]> {
  const db = await getDbClient();
  const result = await db.execute<StudentRow>(
    `
      SELECT
        id,
        nickname,
        gender,
        grade,
        description,
        profile_image_url,
        letter_image_url,
        sponsorship_status,
        created_at,
        updated_at
      FROM students
      ORDER BY id ASC
    `,
  );

  return result.rows.map((row) => mapStudentRow(row));
}

export async function getStudentById(id: string): Promise<StudentProfile | null> {
  const db = await getDbClient();
  const result = await db.execute<StudentRow>(
    `
      SELECT
        id,
        nickname,
        gender,
        grade,
        description,
        profile_image_url,
        letter_image_url,
        sponsorship_status,
        created_at,
        updated_at
      FROM students
      WHERE id = ?
      LIMIT 1
    `,
    [id],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapStudentRow(result.rows[0]);
}

export async function updateStudentStatus(
  id: string,
  status: StudentSponsorshipStatus,
): Promise<void> {
  const db = await getDbClient();
  const result = await db.execute(
    `
      UPDATE students
      SET sponsorship_status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [status, id],
  );

  if (result.rowsAffected === 0) {
    throw new Error(`[students repository] Student not found: ${id}`);
  }
}

export async function resetAllStudentStatusesToAvailable(): Promise<number> {
  const db = await getDbClient();
  const result = await db.execute(
    `
      UPDATE students
      SET sponsorship_status = 'available', updated_at = CURRENT_TIMESTAMP
      WHERE sponsorship_status <> 'available'
    `,
  );

  return result.rowsAffected;
}

export async function updateStudentLetterImageUrl(
  id: string,
  letterImageUrl: string | null,
): Promise<void> {
  const db = await getDbClient();
  const normalizedLetterImageUrl = letterImageUrl?.trim() || null;
  const result = await db.execute(
    `
      UPDATE students
      SET letter_image_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [normalizedLetterImageUrl, id],
  );

  if (result.rowsAffected === 0) {
    throw new Error(`${STUDENT_NOT_FOUND_ERROR_PREFIX}${id}`);
  }
}

export async function updateStudentStatusByInput(
  input: UpdateStudentStatusInput,
): Promise<void> {
  return updateStudentStatus(input.id, input.sponsorshipStatus);
}

export async function createStudent(data: CreateStudentInput): Promise<StudentProfile> {
  const db = await getDbClient();
  const studentId = makeStudentId();
  const sponsorshipStatus = data.sponsorshipStatus ?? "available";
  const profileImageUrl = resolveStudentProfileImageUrl(studentId, data.gender);

  await db.execute(
    `
      INSERT INTO students (
        id,
        nickname,
        gender,
        grade,
        description,
        profile_image_url,
        letter_image_url,
        sponsorship_status,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, NULL, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `,
    [
      studentId,
      data.nickname.trim(),
      data.gender,
      data.grade.trim(),
      data.description.trim(),
      profileImageUrl,
      sponsorshipStatus,
    ],
  );

  const created = await getStudentById(studentId);
  if (!created) {
    throw new Error(
      `[students repository] Failed to load created student: ${studentId}`,
    );
  }

  return created;
}

export async function deleteStudent(id: string): Promise<void> {
  const db = await getDbClient();
  const studentId = id.trim();

  const sponsorshipCountResult = await db.execute<{ count: number }>(
    `
      SELECT COUNT(*) AS count
      FROM sponsorships
      WHERE student_id = ?
    `,
    [studentId],
  );

  const sponsorshipCount = Number(sponsorshipCountResult.rows[0]?.count ?? 0);
  if (sponsorshipCount > 0) {
    throw new Error(`${STUDENT_DELETE_BLOCKED_ERROR_PREFIX}${studentId}`);
  }

  const result = await db.execute(
    `
      DELETE FROM students
      WHERE id = ?
    `,
    [studentId],
  );

  if (result.rowsAffected === 0) {
    throw new Error(`${STUDENT_NOT_FOUND_ERROR_PREFIX}${studentId}`);
  }
}

export function isStudentNotFoundError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.startsWith(STUDENT_NOT_FOUND_ERROR_PREFIX);
}

export function isStudentDeleteBlockedError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.startsWith(STUDENT_DELETE_BLOCKED_ERROR_PREFIX);
}
