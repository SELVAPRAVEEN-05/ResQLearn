import { fontSans } from "@/config/fonts";
import { siteConfig } from "@/config/site";
import { getSiteBaseUrl } from "@/lib/site-url";

import "@/styles/globals.css";
import clsx from "clsx";
import { Metadata, Viewport } from "next";

import { Providers } from "./providers";

const baseUrl = getSiteBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "SafeGraph AI - Disaster Preparedness Education & AI Risk Telemetry",
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "Disaster Preparedness",
    "SafeGraph AI",
    "Heatwave AI Predictor",
    "Emergency Response",
    "Knowledge Graph Education",
    "Erode Heatwave Telemetry",
    "Disaster Risk Reduction",
    "School Emergency Preparedness",
  ],
  authors: [{ name: "SafeGraph AI Team" }],
  creator: "SafeGraph AI",
  publisher: "SafeGraph AI",
  manifest: "/manifest.json",
  icons: {
    icon: "/images/image.png",
    apple: "/images/app_logo.png",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "google8775e75da767a65c",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: siteConfig.name,
    title: "SafeGraph AI - Disaster Preparedness Education & AI Risk Telemetry",
    description: siteConfig.description,
    images: [
      {
        url: "/images/app_logo.png",
        width: 800,
        height: 800,
        alt: "SafeGraph AI Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SafeGraph AI - Disaster Preparedness Education",
    description: siteConfig.description,
    images: ["/images/app_logo.png"],
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body className={clsx("font-sans m-0", fontSans.variable)}>
        <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
          <div>
            <main>{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
