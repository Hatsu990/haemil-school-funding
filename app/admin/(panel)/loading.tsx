import { PageLoading } from "@/components/ui/page-loading";

export default function AdminPanelLoadingPage() {
  return (
    <PageLoading
      title="관리자 데이터를 불러오는 중입니다."
      description="운영 현황을 준비하고 있습니다."
      cardCount={6}
    />
  );
}
