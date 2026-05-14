import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  "https://haemil-school-funding.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/students", "/about", "/project", "/gallery"],
        disallow: ["/admin", "/admin/*"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
