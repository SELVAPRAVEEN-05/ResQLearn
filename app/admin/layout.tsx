"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, BookOpen, HelpCircle, BarChart2 } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Content", href: "/admin/content", icon: BookOpen },
  { label: "Questions", href: "/admin/quiz-questions", icon: HelpCircle },
  { label: "Reports", href: "/admin/quiz-reports", icon: BarChart2 },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#F5F7F8] text-[#111827]">
      <main className="mx-auto max-w-md px-4 pb-28 pt-4">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-[#E5E7EB] bg-white px-2 pb-[env(safe-area-inset-bottom)] pt-2">
        <div className="mx-auto flex max-w-md items-center justify-between">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
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
  );
}
