import { Navbar } from "@/components/navbar";
import  Loader  from "@/components/loader";
import { fontSans } from "@/config/fonts";
import { siteConfig } from "@/config/site";
import "@/styles/globals.css";
import clsx from "clsx";
import { Metadata, Viewport } from "next";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
   manifest: "/manifest.json",
  description: siteConfig.description,
  icons: {
    icon: "https://img.freepik.com/premium-vector/sp-letter-logo-design-with-circle-shape-sp-circle-cube-shape-logo-design-sp-monogram-busine_629210-698.jpg",
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
      <head  />
      <body className={clsx("font-sans m-0", fontSans.variable)}>
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <Loader>
            <div
              id="scroll-container"
              className="h-[100dvh] w-screen overflow-y-scroll
              [&::-webkit-scrollbar]:w-1.5
              [&::-webkit-scrollbar-thumb]:rounded-full
              [&::-webkit-scrollbar-track]:bg-[transparent]
              [&::-webkit-scrollbar-thumb]:bg-primary"
            >
              <Navbar />
              <main>{children}</main>
            </div>
          </Loader>
        </Providers>
      </body>
    </html>
  );
}
