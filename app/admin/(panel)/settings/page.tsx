import { AdminSettingsManager } from "@/components/admin/admin-settings-manager";
import { buildDbErrorMessage, logDbLoadError } from "@/lib/db/debug";
import { getSettings } from "@/lib/repositories/settings";
import {
  ADMIN_SETTINGS_DEFAULT_VALUES,
  buildAdminSettingsFormValues,
} from "@/lib/settings/admin-settings";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  let initialValues = ADMIN_SETTINGS_DEFAULT_VALUES;
  let dbErrorMessage: string | null = null;

  try {
    const settings = await getSettings();
    initialValues = buildAdminSettingsFormValues(settings);
  } catch (error) {
    logDbLoadError("admin settings page", error);
    dbErrorMessage = buildDbErrorMessage(
      "설정 데이터를 불러오지 못했습니다. DB 연결 상태를 확인한 뒤 다시 시도해 주세요.",
    );
  }

  return (
    <div className="space-y-5 pb-8">
      <section className="surface-card p-5">
        <h2 className="text-lg font-bold text-[#2f241d]">운영 설정</h2>
        <p className="mt-2 text-sm subtle-text">
          관리자 연락, 문자 표시값, 운영 공개/신청 정책, 기본 목표값을 관리합니다.
        </p>
      </section>

      {dbErrorMessage ? (
        <section className="surface-card p-6 text-sm leading-7 text-[#5b473b]">
          <p className="font-semibold text-[#8c4f2d]">데이터 연결 안내</p>
          <p className="mt-2">{dbErrorMessage}</p>
        </section>
      ) : (
        <AdminSettingsManager initialValues={initialValues} />
      )}
    </div>
  );
}
