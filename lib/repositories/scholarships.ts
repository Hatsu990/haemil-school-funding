import { randomUUID } from "node:crypto";
import { getDbClient } from "@/lib/db/client";
import {
  SCHOLARSHIP_AMOUNT_BY_TYPE,
  resolveScholarshipTypeByDistribution,
} from "@/lib/scholarships";
import {
  ScholarshipType,
  StudentProfile,
  StudentScholarshipRecord,
  StudentScholarshipRecordRow,
  StudentScholarshipView,
} from "@/types";

let scholarshipSchemaReady: Promise<void> | null = null;

function makeScholarshipRecordId(): string {
  return `sch-${randomUUID()}`;
}

function mapRecordRow(row: StudentScholarshipRecordRow): StudentScholarshipRecord {
  return {
    id: row.id,
    studentId: row.student_id,
    scholarshipType: row.scholarship_type,
    studentName: row.student_name,
    studentPhone: row.student_phone,
    parentName: row.parent_name,
    parentPhone: row.parent_phone,
    bankAccount: row.bank_account,
    residentRegistrationFileUrl: row.resident_registration_file_url,
    bankbookFileUrl: row.bankbook_file_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function ensureScholarshipSchema(): Promise<void> {
  if (!scholarshipSchemaReady) {
    scholarshipSchemaReady = (async () => {
      const db = await getDbClient();
      await db.execute(`
        CREATE TABLE IF NOT EXISTS student_scholarship_records (
          id TEXT PRIMARY KEY,
          student_id TEXT NOT NULL UNIQUE,
          scholarship_type TEXT NOT NULL
            CHECK (scholarship_type IN ('전액장학금', '반액장학금', '부분장학금')),
          student_name TEXT NOT NULL DEFAULT '',
          student_phone TEXT NOT NULL DEFAULT '',
          parent_name TEXT NOT NULL DEFAULT '',
          parent_phone TEXT NOT NULL DEFAULT '',
          bank_account TEXT NOT NULL DEFAULT '',
          resident_registration_file_url TEXT,
          bankbook_file_url TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (student_id) REFERENCES students(id) ON UPDATE CASCADE ON DELETE CASCADE
        )
      `);
      await db.execute(
        "CREATE INDEX IF NOT EXISTS idx_student_scholarship_records_student_id ON student_scholarship_records (student_id)",
      );
      await db.execute(
        "CREATE INDEX IF NOT EXISTS idx_student_scholarship_records_type ON student_scholarship_records (scholarship_type)",
      );
      await db.execute(`
        CREATE TRIGGER IF NOT EXISTS trg_student_scholarship_records_updated_at
        AFTER UPDATE ON student_scholarship_records
        FOR EACH ROW
        WHEN NEW.updated_at = OLD.updated_at
        BEGIN
          UPDATE student_scholarship_records
          SET updated_at = CURRENT_TIMESTAMP
          WHERE id = NEW.id;
        END
      `);
    })();
  }

  return scholarshipSchemaReady;
}

export async function getScholarshipRecordsByStudentIds(
  studentIds: string[],
): Promise<Map<string, StudentScholarshipRecord>> {
  await ensureScholarshipSchema();
  const ids = studentIds.map((id) => id.trim()).filter(Boolean);
  const recordMap = new Map<string, StudentScholarshipRecord>();
  if (ids.length === 0) {
    return recordMap;
  }

  const db = await getDbClient();
  const placeholders = ids.map(() => "?").join(", ");
  const result = await db.execute<StudentScholarshipRecordRow>(
    `
      SELECT
        id,
        student_id,
        scholarship_type,
        student_name,
        student_phone,
        parent_name,
        parent_phone,
        bank_account,
        resident_registration_file_url,
        bankbook_file_url,
        created_at,
        updated_at
      FROM student_scholarship_records
      WHERE student_id IN (${placeholders})
    `,
    ids,
  );

  result.rows.forEach((row) => {
    const record = mapRecordRow(row);
    recordMap.set(record.studentId, record);
  });

  return recordMap;
}

export async function buildScholarshipViews(
  students: StudentProfile[],
): Promise<StudentScholarshipView[]> {
  const recordsByStudentId = await getScholarshipRecordsByStudentIds(
    students.map((student) => student.id),
  );

  return students.map((student, index) => {
    const record = recordsByStudentId.get(student.id) ?? null;
    const scholarshipType =
      record?.scholarshipType ??
      resolveScholarshipTypeByDistribution(index, students.length);

    return {
      student,
      scholarshipType,
      scholarshipAmount: SCHOLARSHIP_AMOUNT_BY_TYPE[scholarshipType],
      record,
    };
  });
}

export interface UpsertStudentScholarshipRecordInput {
  studentId: string;
  scholarshipType: ScholarshipType;
  studentName: string;
  studentPhone: string;
  parentName: string;
  parentPhone: string;
  bankAccount: string;
}

export async function upsertStudentScholarshipRecord(
  input: UpsertStudentScholarshipRecordInput,
): Promise<StudentScholarshipRecord> {
  await ensureScholarshipSchema();
  const db = await getDbClient();
  const recordId = makeScholarshipRecordId();

  await db.execute(
    `
      INSERT INTO student_scholarship_records (
        id,
        student_id,
        scholarship_type,
        student_name,
        student_phone,
        parent_name,
        parent_phone,
        bank_account,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(student_id)
      DO UPDATE SET
        scholarship_type = excluded.scholarship_type,
        student_name = excluded.student_name,
        student_phone = excluded.student_phone,
        parent_name = excluded.parent_name,
        parent_phone = excluded.parent_phone,
        bank_account = excluded.bank_account,
        updated_at = CURRENT_TIMESTAMP
    `,
    [
      recordId,
      input.studentId,
      input.scholarshipType,
      input.studentName.trim(),
      input.studentPhone.trim(),
      input.parentName.trim(),
      input.parentPhone.trim(),
      input.bankAccount.trim(),
    ],
  );

  const record = await getScholarshipRecordByStudentId(input.studentId);
  if (!record) {
    throw new Error(
      `[scholarships repository] failed to load scholarship record: ${input.studentId}`,
    );
  }

  return record;
}

export async function getScholarshipRecordByStudentId(
  studentId: string,
): Promise<StudentScholarshipRecord | null> {
  await ensureScholarshipSchema();
  const db = await getDbClient();
  const result = await db.execute<StudentScholarshipRecordRow>(
    `
      SELECT
        id,
        student_id,
        scholarship_type,
        student_name,
        student_phone,
        parent_name,
        parent_phone,
        bank_account,
        resident_registration_file_url,
        bankbook_file_url,
        created_at,
        updated_at
      FROM student_scholarship_records
      WHERE student_id = ?
      LIMIT 1
    `,
    [studentId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapRecordRow(result.rows[0]);
}

export async function updateStudentScholarshipFileUrl(
  studentId: string,
  fileKind: "residentRegistration" | "bankbook",
  fileUrl: string | null,
): Promise<void> {
  await ensureScholarshipSchema();
  const column =
    fileKind === "residentRegistration"
      ? "resident_registration_file_url"
      : "bankbook_file_url";
  const db = await getDbClient();

  await db.execute(
    `
      UPDATE student_scholarship_records
      SET ${column} = ?, updated_at = CURRENT_TIMESTAMP
      WHERE student_id = ?
    `,
    [fileUrl?.trim() || null, studentId],
  );
}
