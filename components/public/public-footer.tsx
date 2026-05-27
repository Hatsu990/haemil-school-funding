import Image from "next/image";
import Link from "next/link";
import { getSettings } from "@/lib/repositories/settings";
import {
  ADMIN_SETTINGS_DEFAULT_VALUES,
  ADMIN_SETTINGS_KEYS,
} from "@/lib/settings/admin-settings";

function getSettingValue(
  settings: Array<{ settingKey: string; settingValue: string }>,
  key: string,
  fallback: string,
): string {
  return settings.find((setting) => setting.settingKey === key)?.settingValue ?? fallback;
}

export async function PublicFooter() {
  let representativePhone = ADMIN_SETTINGS_DEFAULT_VALUES.representativeContactPhone;
  let sponsorshipPhone = ADMIN_SETTINGS_DEFAULT_VALUES.sponsorshipContactPhone;

  try {
    const settings = await getSettings();
    representativePhone = getSettingValue(
      settings,
      ADMIN_SETTINGS_KEYS.representativeContactPhone,
      representativePhone,
    );
    sponsorshipPhone = getSettingValue(
      settings,
      ADMIN_SETTINGS_KEYS.sponsorshipContactPhone,
      sponsorshipPhone,
    );
  } catch (error) {
    console.error("[public footer] failed to load public contact settings", error);
  }

  return (
    <footer className="relative mt-20 overflow-hidden border-t border-[#d9d2c5] bg-[#18211d] text-white">
      <Image
        src="/images/haemill/school-campus-1.jpg"
        alt=""
        fill
        aria-hidden
        className="object-cover opacity-20"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#18211d]/96 via-[#24372c]/92 to-[#4a382f]/88" />

      <div className="relative z-10 mx-auto w-full max-w-[1360px] px-5 py-10 sm:px-7 lg:max-w-[1480px] lg:px-10 xl:max-w-[1560px] xl:px-12 md:grid md:grid-cols-[1.2fr_0.8fr] md:items-start">
        <div>
          <div className="inline-flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="relative h-[86px] w-[86px] shrink-0 sm:h-[104px] sm:w-[104px]"
              aria-label="해밀학교 홈"
            >
              <Image
                src="/images/haemill/haemill-school-logo.png"
                alt="해밀학교 로고"
                fill
                className="object-contain drop-shadow-[0_12px_22px_rgba(0,0,0,0.28)]"
                sizes="(max-width: 640px) 86px, 104px"
              />
            </Link>

            <Link href="/" className="block">
              <p className="text-[0.68rem] leading-none font-bold uppercase tracking-[0.16em] text-[#c7d4c6]">
                Haemill School
              </p>
              <h3 className="mt-1 text-xl leading-tight font-black text-white sm:text-2xl">
                해밀학교와 함께하는 3년 장학금 결연
              </h3>
            </Link>
          </div>
        </div>

        <div className="mt-8 md:mt-0 md:justify-self-end md:text-right">
          <p className="text-sm font-bold text-white">문의 안내</p>
          <ul className="mt-3 space-y-2 text-sm text-[#d8ded7]">
            <li>대표 연락: {representativePhone}</li>
            <li>장학금 결연 상담: {sponsorshipPhone}</li>
            <li className="flex flex-wrap items-baseline gap-x-1.5 md:justify-end">
              <span>평일 상담:</span>
              <span className="inline-grid grid-cols-[3.9rem_0.8rem_3.9rem] items-baseline font-mono text-[1.08em] font-bold tracking-[0.01em] text-white tabular-nums">
                <span className="text-center">09:00</span>
                <span className="text-center text-[#c7d4c6]">-</span>
                <span className="text-center">18:00</span>
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative z-10 border-t border-white/12 py-3 text-center text-xs text-[#b9c5bb]">
        © 2026 해밀학교와 함께하는 3년 장학금 결연. All rights reserved.
      </div>
    </footer>
  );
}
