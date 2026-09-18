"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  ShieldCheck,
  ArrowLeft,
  Home,
  BookOpen,
  FileQuestion,
  Bot,
  User,
  Settings,
} from "lucide-react";
import Link from "next/link";

import NotificationBell from "@/components/NotificationBell";

const navItems = [
  { label: "Home", href: "/user/dashboard", icon: Home },
  { label: "Learn", href: "/user/learn", icon: BookOpen },
  { label: "Quiz", href: "/user/quiz", icon: FileQuestion },
  { label: "AI", href: "/user/assistant", icon: Bot },
  { label: "Profile", href: "/user/profile", icon: User },
];

const topLevelPaths = [
  "/user",
  "/user/dashboard",
  "/user/learn",
  "/user/quiz",
  "/user/assistant",
  "/user/profile",
  "/user/heatwave",
];
const hideGlobalHeaderPaths = ["/user/notifications"];

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isTopLevel = topLevelPaths.includes(pathname);
  const hideHeader = hideGlobalHeaderPaths.includes(pathname);
  const isProfile = pathname.startsWith("/user/profile");

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827]">
      {!hideHeader && (
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#E5E7EB] bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            {!isTopLevel && (
              <button
                aria-label="Go back"
                className="mr-1 -ml-1 rounded-full p-1 transition hover:bg-[#F3F4F6]"
                onClick={() => router.back()}
              >
                <ArrowLeft className="text-[#111827]" size={18} />
              </button>
            )}
            <ShieldCheck className="text-[#10B981]" size={20} />
            <p className="text-base font-bold text-[#111827]">SafeGraph AI</p>
          </div>

          {isProfile ? (
            <Link
              aria-label="Settings"
              className="rounded-full p-2 transition hover:bg-[#F3F4F6]"
              href="/user/profile/edit"
            >
              <Settings className="text-[#111827]" size={20} />
            </Link>
          ) : (
            <NotificationBell role="student" />
          )}
        </header>
      )}

      <main className="mx-auto max-w-md px-4 pb-28 pt-4">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-[#E5E7EB] bg-white px-2 pb-[env(safe-area-inset-bottom)] pt-2">
        <div className="mx-auto flex max-w-md items-center justify-between">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                className="flex flex-1 flex-col items-center gap-1 py-1.5"
                href={item.href}
              >
                <span
                  className={
                    active
                      ? "flex h-8 w-14 items-center justify-center rounded-full bg-[#10B981] text-white"
                      : "flex h-8 w-14 items-center justify-center text-[#6B7280]"
                  }
                >
                  <Icon size={18} />
                </span>
                <span
                  className={
                    active
                      ? "text-[11px] font-bold text-[#10B981]"
                      : "text-[11px] font-medium text-[#6B7280]"
                  }
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
