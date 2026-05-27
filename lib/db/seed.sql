-- Development seed data for Haemil School Funding
PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

DELETE FROM sms_logs;
DELETE FROM gallery_items;
DELETE FROM sponsorships;
DELETE FROM students;
DELETE FROM settings;

INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-001', '맑은 별빛', '여', '중1', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (중1)', NULL, NULL, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-002', '맑은 꽃길', '남', '중2', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (중2)', NULL, NULL, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-003', '맑은 바다', '여', '중3', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (중3)', NULL, NULL, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-004', '맑은 숲길', '남', '고1', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (고1)', NULL, NULL, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-005', '맑은 하늘', '여', '고2', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (고2)', NULL, NULL, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-006', '맑은 무지개', '남', '고3', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (고3)', NULL, NULL, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-007', '따뜻한 별빛', '여', '중1', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (중1)', NULL, NULL, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-008', '따뜻한 꽃길', '남', '중2', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (중2)', NULL, NULL, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-009', '따뜻한 바다', '여', '중3', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (중3)', NULL, NULL, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-010', '따뜻한 숲길', '남', '고1', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (고1)', NULL, NULL, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-011', '따뜻한 하늘', '여', '고2', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (고2)', NULL, NULL, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-012', '따뜻한 무지개', '남', '고3', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (고3)', NULL, NULL, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-013', '단단한 별빛', '여', '중1', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (중1)', NULL, NULL, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-014', '단단한 꽃길', '남', '중2', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (중2)', NULL, NULL, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-015', '단단한 바다', '여', '중3', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (중3)', NULL, NULL, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-016', '단단한 숲길', '남', '고1', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (고1)', NULL, NULL, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-017', '단단한 하늘', '여', '고2', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (고2)', NULL, NULL, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-018', '단단한 무지개', '남', '고3', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (고3)', NULL, NULL, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-019', '고운 별빛', '여', '중1', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (중1)', NULL, NULL, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-020', '고운 꽃길', '남', '중2', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (중2)', NULL, NULL, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-021', '고운 바다', '여', '중3', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (중3)', NULL, NULL, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-022', '고운 숲길', '남', '고1', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (고1)', NULL, NULL, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-023', '고운 하늘', '여', '고2', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (고2)', NULL, NULL, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-024', '고운 무지개', '남', '고3', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (고3)', NULL, NULL, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-025', '빛나는 별빛', '여', '중1', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (중1)', NULL, NULL, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-026', '빛나는 꽃길', '남', '중2', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (중2)', NULL, NULL, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-027', '빛나는 바다', '여', '중3', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (중3)', NULL, NULL, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-028', '빛나는 숲길', '남', '고1', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (고1)', NULL, NULL, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-029', '빛나는 하늘', '여', '고2', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (고2)', NULL, NULL, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-030', '빛나는 무지개', '여', '고3', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (고3)', NULL, NULL, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-031', '산뜻한 별빛', '여', '중1', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (중1)', NULL, NULL, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-032', '산뜻한 꽃길', '남', '중2', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (중2)', NULL, NULL, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-033', '산뜻한 바다', '여', '중3', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (중3)', NULL, NULL, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-034', '산뜻한 숲길', '남', '고1', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (고1)', NULL, NULL, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-035', '산뜻한 하늘', '여', '고2', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (고2)', NULL, NULL, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-036', '산뜻한 무지개', '남', '고3', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (고3)', NULL, NULL, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-037', '포근한 별빛', '여', '중1', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (중1)', NULL, NULL, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-038', '포근한 꽃길', '남', '중2', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (중2)', NULL, NULL, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-039', '포근한 바다', '여', '중3', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (중3)', NULL, NULL, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-040', '포근한 숲길', '남', '고1', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (고1)', NULL, NULL, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-041', '포근한 하늘', '여', '고2', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (고2)', NULL, NULL, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-042', '포근한 무지개', '남', '고3', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (고3)', NULL, NULL, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-043', '든든한 별빛', '여', '중1', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (중1)', NULL, NULL, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-044', '든든한 꽃길', '남', '중2', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (중2)', NULL, NULL, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-045', '든든한 바다', '여', '중3', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (중3)', NULL, NULL, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-046', '든든한 숲길', '남', '고1', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (고1)', NULL, NULL, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-047', '든든한 하늘', '여', '고2', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (고2)', NULL, NULL, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-048', '든든한 무지개', '남', '고3', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (고3)', NULL, NULL, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-049', '환한 별빛', '여', '중1', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (중1)', NULL, NULL, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-050', '환한 꽃길', '남', '중2', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (중2)', NULL, NULL, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-051', '환한 바다', '여', '중3', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (중3)', NULL, NULL, 'matched', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-052', '환한 숲길', '남', '고1', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (고1)', NULL, NULL, 'matched', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-053', '환한 하늘', '여', '고2', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (고2)', NULL, NULL, 'matched', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-054', '환한 무지개', '남', '고3', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (고3)', NULL, NULL, 'matched', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-055', '은은한 별빛', '여', '중1', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (중1)', NULL, NULL, 'matched', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-056', '은은한 꽃길', '남', '중2', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (중2)', NULL, NULL, 'matched', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-057', '은은한 바다', '여', '중3', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (중3)', NULL, NULL, 'matched', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-058', '은은한 숲길', '남', '고1', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (고1)', NULL, NULL, 'matched', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-059', '은은한 하늘', '여', '고2', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (고2)', NULL, NULL, 'matched', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO students (id, nickname, gender, grade, description, profile_image_url, letter_image_url, sponsorship_status, created_at, updated_at)
VALUES ('st-060', '은은한 무지개', '여', '고3', '해밀학교 학생으로 배움과 생활을 균형 있게 이어가며 성장하고 있습니다. (고3)', NULL, NULL, 'matched', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Student profile image mapping (Profile1: 남, Profile2: 여)
UPDATE students
SET profile_image_url = CASE
  WHEN gender = '남' THEN '/students/profiles/male/' || printf('%d.png', ((CAST(substr(id, 4) AS INTEGER) - 1) % 31) + 6)
  WHEN gender = '여' THEN '/students/profiles/female/' || printf('%d.png', ((CAST(substr(id, 4) AS INTEGER) - 1) % 36) + 1)
  ELSE '/students/profiles/female/' || printf('%d.png', ((CAST(substr(id, 4) AS INTEGER) - 1) % 36) + 1)
END;

-- Sponsorship sample rows
INSERT INTO sponsorships (id, student_id, sponsor_name, sponsor_phone, sponsor_email, sponsorship_type, sponsorship_period, sponsor_public, sponsor_message, receipt_requested, status, created_at, updated_at) VALUES
('sp-dev-001','st-038','김후원','010-1200-3301','donor1@example.com','정기후원','12개월',1,'학생의 생활과 배움을 꾸준히 응원합니다.',1,'입금대기',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('sp-dev-002','st-039','이응원','010-1200-3302','donor2@example.com','일시후원','1회',1,'필요한 시기에 도움이 되길 바랍니다.',0,'입금대기',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('sp-dev-003','st-045','박나눔','010-1200-3303','donor3@example.com','정기후원','6개월',0,'건강하게 학교생활 이어가길 바랍니다.',1,'입금대기',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('sp-dev-004','st-052','최동행','010-1200-3304','donor4@example.com','정기후원','12개월',1,'꾸준히 성장할 수 있도록 함께하겠습니다.',1,'입금완료',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('sp-dev-005','st-054','정마음','010-1200-3305','donor5@example.com','일시후원','1회',1,'응원하는 마음을 전합니다.',0,'입금완료',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('sp-dev-006','st-056','윤다정','010-1200-3306','donor6@example.com','정기후원','3개월',1,'학업과 생활 모두 응원합니다.',0,'입금완료',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
INSERT INTO sponsorships (id, student_id, sponsor_name, sponsor_phone, sponsor_email, sponsorship_type, sponsorship_period, sponsor_public, sponsor_message, receipt_requested, status, created_at, updated_at) VALUES ('sp-dev-007','st-018','한별','010-1200-3307','donor7@example.com','정기후원','6개월',0,'다시 좋은 인연으로 이어지길 바랍니다.',0,'취소',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
INSERT INTO sponsorships (id, student_id, sponsor_name, sponsor_phone, sponsor_email, sponsorship_type, sponsorship_period, sponsor_public, sponsor_message, receipt_requested, status, created_at, updated_at) VALUES ('sp-dev-008','st-021','오햇살','010-1200-3308','donor8@example.com','일시후원','1회',1,'상황이 정리되면 다시 후원하겠습니다.',0,'취소',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

-- Gallery sample rows
INSERT INTO gallery_items (id, title, type, file_url, created_at) VALUES
('ga-dev-001','기숙사 일과 스케치','image','https://example.com/gallery/placeholder-1.jpg',CURRENT_TIMESTAMP),
('ga-dev-002','교내 활동 기록','image','https://example.com/gallery/placeholder-2.jpg',CURRENT_TIMESTAMP),
('ga-dev-003','방과 후 수업 장면','video','https://example.com/gallery/placeholder-3.mp4',CURRENT_TIMESTAMP),
('ga-dev-004','학생 작품 전시','image','https://example.com/gallery/placeholder-4.jpg',CURRENT_TIMESTAMP);

-- Settings defaults
INSERT INTO settings (id, setting_key, setting_value, updated_at) VALUES
('set-dev-001','admin_contact_phone','010-0000-0000',CURRENT_TIMESTAMP),
('set-dev-002','sms_receiver_phone','010-1111-2222',CURRENT_TIMESTAMP),
('set-dev-003','auto_sms_send_time','09:00',CURRENT_TIMESTAMP),
('set-dev-004','site_notice','개발용 시드 데이터입니다.',CURRENT_TIMESTAMP),
('set-dev-005','sms_sender_phone_display','010-0000-0000',CURRENT_TIMESTAMP),
('set-dev-006','site_public_enabled','true',CURRENT_TIMESTAMP),
('set-dev-007','sponsorship_request_enabled','true',CURRENT_TIMESTAMP),
('set-dev-008','default_sponsorship_amount','100000',CURRENT_TIMESTAMP),
('set-dev-009','target_student_count','60',CURRENT_TIMESTAMP);

-- SMS log sample rows
INSERT INTO sms_logs (id, phone, template_name, status, response_message, created_at) VALUES
('sms-dev-001','010-1200-3301','후원신청_접수','성공','개발용 샘플 발송 기록',CURRENT_TIMESTAMP),
('sms-dev-002','010-1200-3302','관리자_알림','대기',NULL,CURRENT_TIMESTAMP);

COMMIT;
