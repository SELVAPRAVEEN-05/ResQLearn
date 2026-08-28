"use client";

import { usePathname, useRouter } from "next/navigation";
import { Bell, ShieldCheck, ArrowLeft, Home, BookOpen, FileQuestion, Bot, User, Settings } from "lucide-react";
import Link from "next/link";

import { MockDataProvider } from "@/contexts/MockDataContext";

const navItems = [
  { label: "Home", href: "/user/dashboard", icon: Home },
  { label: "Learn", href: "/user/learn", icon: BookOpen },
  { label: "Quiz", href: "/user/quiz", icon: FileQuestion },
  { label: "AI", href: "/user/assistant", icon: Bot },
  { label: "Profile", href: "/user/profile", icon: User },
];

const topLevelPaths = ["/user", "/user/dashboard", "/user/learn", "/user/quiz", "/user/assistant", "/user/profile"];
const hideGlobalHeaderPaths = ["/user/notifications"];

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isTopLevel = topLevelPaths.includes(pathname);
  const hideHeader = hideGlobalHeaderPaths.includes(pathname);
  const isProfile = pathname.startsWith("/user/profile");

  return (
    <MockDataProvider>
      <div className="min-h-screen bg-[#F9FAFB] text-[#111827]">
      {!hideHeader && (
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#E5E7EB] bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            {!isTopLevel && (
              <button onClick={() => router.back()} className="mr-1 -ml-1 rounded-full p-1 transition hover:bg-[#F3F4F6]" aria-label="Go back">
                <ArrowLeft size={18} className="text-[#111827]" />
              </button>
            )}
            <ShieldCheck size={20} className="text-[#10B981]" />
            <p className="text-base font-semibold text-[#111827]">SafeGraph AI</p>
          </div>

          {isProfile ? (
            <Link href="/user/settings" className="rounded-full p-2 transition hover:bg-[#F3F4F6]" aria-label="Settings">
              <Settings size={20} className="text-[#111827]" />
            </Link>
          ) : (
            <Link href="/user/notifications" className="rounded-full p-2 transition hover:bg-[#F3F4F6]" aria-label="Notifications">
              <Bell size={20} className="text-[#111827]" />
            </Link>
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
              <Link key={item.href} href={item.href} className="flex flex-1 flex-col items-center gap-1 py-1.5">
                <span className={active ? "flex h-8 w-14 items-center justify-center rounded-full bg-[#10B981] text-white" : "flex h-8 w-14 items-center justify-center text-[#6B7280]"}>
                  <Icon size={18} />
                </span>
                <span className={active ? "text-[11px] font-semibold text-[#10B981]" : "text-[11px] font-medium text-[#6B7280]"}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
    </MockDataProvider>
  );
}