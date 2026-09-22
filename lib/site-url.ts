/**
 * Utility to resolve the site base URL dynamically for canonical URLs,
 * Open Graph metadata, sitemap.xml, and robots.txt.
 * Prioritizes process.env.APP_URL, process.env.NEXT_PUBLIC_APP_URL,
 * or process.env.VERCEL_URL in Vercel production deployment.
 */
export function getSiteBaseUrl(): string {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, "");
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    const url = process.env.VERCEL_URL.replace(/\/$/, "");
    return url.startsWith("http") ? url : `https://${url}`;
  }

  return "https://res-q-learn.vercel.app";
}
