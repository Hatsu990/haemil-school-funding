import type { Metadata } from "next";
import { Nanum_Myeongjo, Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const nanumMyeongjo = Nanum_Myeongjo({
  variable: "--font-nanum-myeongjo",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  "https://haemill-school-funding.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "해밀학교 3년 장학금 1:1 결연 후원",
    template: "%s | 해밀학교 후원 프로젝트",
  },
  description:
    "해밀학교 학생들의 학업과 꿈을 위한 3년 장학금 1:1 결연 후원 서비스. 다문화학교 장학 결연 운영 현황을 투명하게 안내합니다.",
  keywords: [
    "해밀학교",
    "다문화학교",
    "3년 학업 장학 결연",
    "1:1 결연",
    "장학금 결연",
  ],
  openGraph: {
    title: "해밀학교 3년 장학금 1:1 결연 후원",
    description:
      "해밀학교 학생들의 학업과 꿈을 위한 3년 장학금 1:1 결연 후원 서비스. 다문화학교 장학 결연을 함께합니다.",
    url: SITE_URL,
    siteName: "해밀학교 후원 프로젝트",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "해밀학교 3년 장학금 1:1 결연 후원",
    description:
      "다문화학교 학생들의 학업과 꿈을 지원하는 해밀학교 3년 장학금 1:1 결연 프로젝트",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${notoSansKr.variable} ${nanumMyeongjo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
