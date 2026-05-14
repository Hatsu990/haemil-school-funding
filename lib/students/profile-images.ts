import { StudentGender } from "@/types";

const MALE_IMAGE_MIN = 6;
const MALE_IMAGE_MAX = 36;
const FEMALE_IMAGE_MIN = 1;
const FEMALE_IMAGE_MAX = 36;

const MALE_IMAGE_COUNT = MALE_IMAGE_MAX - MALE_IMAGE_MIN + 1;
const FEMALE_IMAGE_COUNT = FEMALE_IMAGE_MAX - FEMALE_IMAGE_MIN + 1;

const MALE_BASE_PATH = "/students/profiles/male";
const FEMALE_BASE_PATH = "/students/profiles/female";

export const STUDENT_PROFILE_FALLBACK_IMAGE_URL =
  "/students/profiles/fallback.svg";

function getLastNumericSegment(value: string): number | null {
  const matches = value.match(/\d+/g);
  if (!matches || matches.length === 0) {
    return null;
  }

  const lastSegment = Number.parseInt(matches[matches.length - 1], 10);
  if (Number.isNaN(lastSegment)) {
    return null;
  }

  return lastSegment;
}

function getStringHash(value: string): number {
  let hash = 0;
  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}

function getStableIndex(studentId: string, length: number): number {
  const serial = getLastNumericSegment(studentId);
  if (serial !== null) {
    return Math.abs(serial - 1) % length;
  }

  return getStringHash(studentId) % length;
}

function getMaleProfileImageUrl(studentId: string): string {
  const index = getStableIndex(studentId, MALE_IMAGE_COUNT);
  const fileNumber = MALE_IMAGE_MIN + index;
  return `${MALE_BASE_PATH}/${fileNumber}.png`;
}

function getFemaleProfileImageUrl(studentId: string): string {
  const index = getStableIndex(studentId, FEMALE_IMAGE_COUNT);
  const fileNumber = FEMALE_IMAGE_MIN + index;
  return `${FEMALE_BASE_PATH}/${fileNumber}.png`;
}

export function buildStudentProfileImageUrl(
  studentId: string,
  gender: StudentGender,
): string {
  if (gender === "남") {
    return getMaleProfileImageUrl(studentId);
  }

  if (gender === "여") {
    return getFemaleProfileImageUrl(studentId);
  }

  const useMale = getStableIndex(studentId, 2) === 0;
  return useMale
    ? getMaleProfileImageUrl(studentId)
    : getFemaleProfileImageUrl(studentId);
}

export function resolveStudentProfileImageUrl(
  studentId: string,
  gender: StudentGender,
  currentUrl?: string | null,
): string {
  const normalized = currentUrl?.trim();
  if (normalized) {
    return normalized;
  }

  return buildStudentProfileImageUrl(studentId, gender);
}
