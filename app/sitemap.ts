import { MetadataRoute } from "next";
import { getSiteBaseUrl } from "@/lib/site-url";

/**
 * Dynamic Next.js sitemap generator (/sitemap.xml).
 * Generates production XML sitemap containing public indexable pages.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteBaseUrl();
  const lastModified = new Date();

  return [
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
