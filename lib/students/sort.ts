import { StudentProfile, StudentSponsorshipStatus } from "@/types";

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

export function sortStudentsByRequestPriority(
  students: StudentProfile[],
): StudentProfile[] {
  return students
    .map((student, index) => ({ student, index }))
    .sort((a, b) => {
      const weightDiff =
        getStudentStatusSortWeight(a.student.sponsorshipStatus) -
        getStudentStatusSortWeight(b.student.sponsorshipStatus);
      return weightDiff !== 0 ? weightDiff : a.index - b.index;
    })
    .map((entry) => entry.student);
}
