import { ScholarshipType } from "@/types";

export const SCHOLARSHIP_TYPES: ScholarshipType[] = [
  "전액장학금",
  "반액장학금",
  "부분장학금",
];

export const SCHOLARSHIP_AMOUNT_BY_TYPE: Record<ScholarshipType, number> = {
  전액장학금: 100000,
  반액장학금: 50000,
  부분장학금: 30000,
};

export const SCHOLARSHIP_RATIO_BY_TYPE: Record<ScholarshipType, number> = {
  전액장학금: 0.2,
  반액장학금: 0.3,
  부분장학금: 0.5,
};

export function getScholarshipTypeLabel(type: ScholarshipType): string {
  if (type === "전액장학금") return "전액 장학금";
  if (type === "반액장학금") return "반액 장학금";
  return "부분 장학금";
}

export function getScholarshipTypeWithAmountLabel(type: ScholarshipType): string {
  const amount = new Intl.NumberFormat("ko-KR").format(
    SCHOLARSHIP_AMOUNT_BY_TYPE[type],
  );
  return `${getScholarshipTypeLabel(type)} (월 ${amount}원)`;
}

export function getScholarshipSupportTierLabel(type: ScholarshipType): string {
  if (type === "전액장학금") return "10 열매후원";
  if (type === "반액장학금") return "5 성장후원";
  return "3 새싹후원";
}

export function getScholarshipSupportTierWithAmountLabel(
  type: ScholarshipType,
): string {
  const amount = new Intl.NumberFormat("ko-KR").format(
    SCHOLARSHIP_AMOUNT_BY_TYPE[type],
  );
  return `${getScholarshipSupportTierLabel(type)} (월 ${amount}원)`;
}

export function resolveScholarshipTypeByDistribution(
  index: number,
  totalCount: number,
): ScholarshipType {
  if (totalCount <= 0) return "부분장학금";

  const fullCount = getScholarshipTypeLimit("전액장학금", totalCount);
  const halfCount = getScholarshipTypeLimit("반액장학금", totalCount);

  if (index < fullCount) return "전액장학금";
  if (index < fullCount + halfCount) return "반액장학금";
  return "부분장학금";
}

export function getScholarshipTypeLimit(
  type: ScholarshipType,
  totalCount: number,
): number {
  if (totalCount <= 0) return 0;

  if (type === "부분장학금") {
    const fullCount = Math.round(totalCount * SCHOLARSHIP_RATIO_BY_TYPE.전액장학금);
    const halfCount = Math.round(totalCount * SCHOLARSHIP_RATIO_BY_TYPE.반액장학금);
    return Math.max(0, totalCount - fullCount - halfCount);
  }

  return Math.round(totalCount * SCHOLARSHIP_RATIO_BY_TYPE[type]);
}

export function formatScholarshipRatio(type: ScholarshipType): string {
  return `${Math.round(SCHOLARSHIP_RATIO_BY_TYPE[type] * 100)}%`;
}

export function getScholarshipUsagePercent(count: number, limit: number): number {
  if (limit <= 0) return count > 0 ? 100 : 0;
  return Math.round((count / limit) * 100);
}

export function isScholarshipType(value: string): value is ScholarshipType {
  return SCHOLARSHIP_TYPES.includes(value as ScholarshipType);
}
