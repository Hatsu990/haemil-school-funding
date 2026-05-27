-- Haemil School Funding - Turso(SQLite) schema
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  nickname TEXT NOT NULL,
  real_name TEXT,
  gender TEXT NOT NULL CHECK (gender IN ('남', '여')),
  grade TEXT NOT NULL,
  description TEXT NOT NULL,
  profile_image_url TEXT,
  letter_image_url TEXT,
  sponsorship_status TEXT NOT NULL DEFAULT 'available'
    CHECK (sponsorship_status IN ('available', 'pending', 'matched')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sponsorships (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  sponsor_name TEXT NOT NULL,
  sponsor_phone TEXT NOT NULL,
  sponsor_email TEXT NOT NULL,
  sponsorship_type TEXT NOT NULL
    CHECK (sponsorship_type IN ('일시후원', '정기후원')),
  sponsorship_period TEXT NOT NULL,
  sponsor_public INTEGER NOT NULL DEFAULT 1 CHECK (sponsor_public IN (0, 1)),
  sponsor_message TEXT,
  receipt_requested INTEGER NOT NULL DEFAULT 0 CHECK (receipt_requested IN (0, 1)),
  status TEXT NOT NULL DEFAULT '입금대기'
    CHECK (status IN ('입금대기', '입금완료', '취소')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS gallery_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  file_url TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sms_logs (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL,
  template_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('성공', '실패', '대기')),
  response_message TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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
);

CREATE INDEX IF NOT EXISTS idx_students_status
  ON students (sponsorship_status);

CREATE INDEX IF NOT EXISTS idx_sponsorships_student_id
  ON sponsorships (student_id);

CREATE INDEX IF NOT EXISTS idx_sponsorships_status
  ON sponsorships (status);

CREATE INDEX IF NOT EXISTS idx_sponsorships_created_at
  ON sponsorships (created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sponsorships_student_active
  ON sponsorships (student_id)
  WHERE status IN ('입금대기', '입금완료');

CREATE INDEX IF NOT EXISTS idx_gallery_items_created_at
  ON gallery_items (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sms_logs_created_at
  ON sms_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_settings_key
  ON settings (setting_key);

CREATE INDEX IF NOT EXISTS idx_student_scholarship_records_student_id
  ON student_scholarship_records (student_id);

CREATE INDEX IF NOT EXISTS idx_student_scholarship_records_type
  ON student_scholarship_records (scholarship_type);

CREATE TRIGGER IF NOT EXISTS trg_students_updated_at
AFTER UPDATE ON students
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE students
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_sponsorships_updated_at
AFTER UPDATE ON sponsorships
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE sponsorships
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_settings_updated_at
AFTER UPDATE ON settings
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE settings
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_student_scholarship_records_updated_at
AFTER UPDATE ON student_scholarship_records
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE student_scholarship_records
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;
