import { PageLoading } from "@/components/ui/page-loading";

export default function GlobalLoadingPage() {
  return (
    <PageLoading
      title="페이지를 준비하고 있습니다."
      description="데이터를 불러오는 중입니다. 잠시만 기다려 주세요."
      cardCount={4}
    />
  );
}
