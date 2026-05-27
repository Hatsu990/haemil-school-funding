import { StudentProfile } from "@/types";

export function maskStudentRealName(realName: string | null | undefined): string {
  const normalized = realName?.trim() ?? "";
  if (!normalized) return "";

  const characters = Array.from(normalized);
  if (characters.length <= 1) {
    return `${characters[0] ?? ""}*`;
  }
  if (characters.length === 2) {
    return `${characters[0]}*`;
  }

  return `${characters[0]}${"*".repeat(characters.length - 2)}${
    characters[characters.length - 1]
  }`;
}

export function getPublicStudentName(student: StudentProfile): string {
  return maskStudentRealName(student.realName) || student.nickname;
}
