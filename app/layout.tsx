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
    default: "해밀학교 생활관비 1:1 결연 후원",
    template: "%s | 해밀학교 후원 프로젝트",
  },
  description:
    "해밀학교 학생 생활관비를 위한 1:1 결연 후원 서비스. 다문화학교 교육 후원과 결연 운영 현황을 투명하게 안내합니다.",
  keywords: [
    "해밀학교",
    "다문화학교",
    "생활관비 후원",
    "1:1 결연",
    "교육 후원",
  ],
  openGraph: {
    title: "해밀학교 생활관비 1:1 결연 후원",
    description:
      "해밀학교 학생 생활관비를 위한 1:1 결연 후원 서비스. 다문화학교 교육 후원을 함께합니다.",
    url: SITE_URL,
    siteName: "해밀학교 후원 프로젝트",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "해밀학교 생활관비 1:1 결연 후원",
    description:
      "다문화학교 학생들의 생활관비를 지원하는 해밀학교 1:1 결연 후원 프로젝트",
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
