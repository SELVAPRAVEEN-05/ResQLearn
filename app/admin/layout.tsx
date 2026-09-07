"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  HelpCircle,
  BarChart2,
  AlertTriangle,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Manage Users", href: "/admin/users", icon: Users },
  { label: "Educational Content", href: "/admin/content", icon: BookOpen },
  { label: "Quiz Questions", href: "/admin/quiz-questions", icon: HelpCircle },
  { label: "Quiz Reports", href: "/admin/quiz-reports", icon: BarChart2 },
  { label: "Alerts", href: "/admin/alerts", icon: AlertTriangle },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    document.cookie = "role=; Max-Age=0; path=/;";
    document.cookie = "token=; Max-Age=0; path=/;";
    window.location.href = "/login";
  };

  const getCurrentPageTitle = () => {
    const item = navItems.find((n) =>
      n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href)
    );
    return item?.label || "Admin Console";
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      {/* Desktop & Tablet Sidebar */}
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-col justify-between border-r border-[#E2E8F0] bg-white shadow-2xs shrink-0 sticky top-0 h-screen z-30">
        <div>
          {/* Brand Logo Header */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-[#F1F5F9]">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#10B981] to-[#059669] text-white shadow-sm font-black text-sm">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-black tracking-tight text-[#0F172A] flex items-center gap-1.5">
                SafeGraph AI
                <span className="rounded-md bg-[#10B981]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#059669]">
                  Admin
                </span>
              </p>
              <p className="text-[11px] font-medium text-[#64748B]">Emergency Control Panel</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-6 space-y-1">
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Main Navigation
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#10B981]/10 text-[#059669] shadow-2xs"
                      : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                        isActive
                          ? "bg-[#10B981] text-white shadow-xs"
                          : "text-[#64748B] group-hover:text-[#0F172A] group-hover:bg-white"
                      }`}
                    >
                      <Icon size={16} />
                    </span>
                    <span className="text-xs">{item.label}</span>
                  </div>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer User & Logout */}
        <div className="p-4 border-t border-[#F1F5F9] bg-[#FAFAFA]">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E2E8F0] font-bold text-xs text-[#475569]">
                AD
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-[#0F172A] truncate">Administrator</p>
                <p className="text-[10px] text-[#64748B] truncate">admin@safegraph.ai</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#FEE2E2] bg-[#FEF2F2] px-3 py-2 text-xs font-bold text-[#DC2626] transition hover:bg-[#FEE2E2] active:scale-98"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#E2E8F0] bg-white/95 px-4 sm:px-6 lg:px-8 py-3.5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9]"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#64748B] hidden sm:inline">Admin</span>
              <ChevronRight size={14} className="text-[#94A3B8] hidden sm:inline" />
              <h2 className="text-sm sm:text-base font-black text-[#0F172A] tracking-tight">
                {getCurrentPageTitle()}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] px-2.5 py-1 text-[11px] font-bold text-[#047857]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
              Neon DB Active
            </span>
            <button
              onClick={handleLogout}
              className="md:hidden flex items-center gap-1 text-xs font-bold text-[#DC2626] bg-[#FEF2F2] px-3 py-1.5 rounded-xl border border-[#FEE2E2]"
            >
              <LogOut size={13} />
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
            <div className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-white shadow-2xl flex flex-col justify-between p-5">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#10B981] text-white font-bold text-xs">
                      <Shield size={16} />
                    </div>
                    <span className="font-bold text-sm text-[#0F172A]">SafeGraph Admin</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9]"
                  >
                    <X size={18} />
                  </button>
                </div>

                <nav className="mt-4 space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      item.href === "/admin"
                        ? pathname === "/admin"
                        : pathname.startsWith(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${
                          isActive
                            ? "bg-[#10B981] text-white shadow-xs"
                            : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                        }`}
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] px-4 py-2.5 text-xs font-bold text-[#DC2626]"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Main Content Container */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-12">
          {children}
        </main>
      </div>
    </div>
  );
}
