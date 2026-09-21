import { MetadataRoute } from "next";
import { getSiteBaseUrl } from "@/lib/site-url";

/**
 * Dynamic Next.js robots.txt generator (/robots.txt).
 * Directs search engines to crawl public pages while blocking private/authenticated routes.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/privacy", "/terms"],
        disallow: [
          "/admin",
          "/admin/*",
          "/user",
          "/user/*",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/api",
          "/api/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
