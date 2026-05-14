import { PageLoading } from "@/components/ui/page-loading";

export default function PublicLoadingPage() {
  return (
    <PageLoading
      title="공개 페이지를 불러오는 중입니다."
      description="학생/후원 정보를 안전하게 불러오고 있습니다."
      cardCount={3}
    />
  );
}
