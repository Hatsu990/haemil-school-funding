import { StudentProfile } from "@/types";
import { resolveStudentProfileImageUrl } from "@/lib/students/profile-images";

const STUDENT_THEME_PALETTE = [
  "from-[#ffd9b8] to-[#ffeede]",
  "from-[#d7ebff] to-[#eef7ff]",
  "from-[#ffe5ec] to-[#fff2f6]",
  "from-[#f7edc4] to-[#fff7d9]",
  "from-[#d9f0e4] to-[#eefaf3]",
  "from-[#dfe6ff] to-[#f1f4ff]",
  "from-[#ffe0cb] to-[#fff0e4]",
  "from-[#d8f3ff] to-[#edf9ff]",
] as const;

const DEFAULT_LETTER_SUMMARY =
  "배움의 시간을 꾸준히 이어가며 생활의 안정을 만들어가고 있습니다.";

function getThemeByStudentId(studentId: string): string {
  const numericPart = Number.parseInt(studentId.replace(/\D/g, ""), 10);
  if (Number.isNaN(numericPart)) {
    return STUDENT_THEME_PALETTE[0];
  }

  return STUDENT_THEME_PALETTE[numericPart % STUDENT_THEME_PALETTE.length];
}

export function withStudentUiFallback(student: StudentProfile): StudentProfile {
  return {
    ...student,
    profileImageUrl: resolveStudentProfileImageUrl(
      student.id,
      student.gender,
      student.profileImageUrl,
    ),
    profileTheme: student.profileTheme ?? getThemeByStudentId(student.id),
    letterSummary: student.letterSummary ?? DEFAULT_LETTER_SUMMARY,
  };
}

export function withStudentUiFallbackList(
  students: StudentProfile[],
): StudentProfile[] {
  return students.map((student) => withStudentUiFallback(student));
}
