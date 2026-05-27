import { SCHOLARSHIP_TYPES } from "@/lib/scholarships";
import { ScholarshipType, StudentProfile, StudentSponsorshipStatus } from "@/types";

const STATUS_ORDER: Record<StudentSponsorshipStatus, number> = {
  available: 0,
  pending: 1,
  matched: 2,
};

export function getStudentStatusSortWeight(
  status: StudentSponsorshipStatus,
): number {
  return STATUS_ORDER[status];
}

export function getScholarshipSortWeight(
  type: ScholarshipType | undefined,
): number {
  if (!type) return SCHOLARSHIP_TYPES.length;
  const index = SCHOLARSHIP_TYPES.indexOf(type);
  return index === -1 ? SCHOLARSHIP_TYPES.length : index;
}

export function sortStudentsByRequestPriority(
  students: StudentProfile[],
): StudentProfile[] {
  return students
    .map((student, index) => ({ student, index }))
    .sort((a, b) => {
      const weightDiff =
        getStudentStatusSortWeight(a.student.sponsorshipStatus) -
        getStudentStatusSortWeight(b.student.sponsorshipStatus);
      if (weightDiff !== 0) return weightDiff;

      const scholarshipDiff =
        getScholarshipSortWeight(a.student.scholarshipType) -
        getScholarshipSortWeight(b.student.scholarshipType);
      return scholarshipDiff !== 0 ? scholarshipDiff : a.index - b.index;
    })
    .map((entry) => entry.student);
}
