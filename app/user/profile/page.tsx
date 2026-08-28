"use client";

import {
  Droplet,
  Mountain,
  Flame,
  Waves,
  Zap,
  ShieldCheck,
  Pencil,
  Award,
  Users,
  HelpCircle,
  LogOut,
  ChevronRight,
  CheckCircle2,
  Sun
} from "lucide-react";
import { useMockData } from "@/contexts/MockDataContext";
import Link from "next/link";

const getIcon = (category: string) => {
  switch (category) {
    case 'Flood': return Droplet;
    case 'Cyclone': return Zap;
    case 'Earthquake': return Mountain;
    case 'Fire': return Flame;
    default: return Sun;
  }
};

export default function ProfilePage() {
  const { profile, courses, quizAttempts } = useMockData();

  // Derived stats
  const completedCoursesCount = courses.filter(c => c.progress === 100).length;
  const totalQuizScore = quizAttempts.reduce((acc, a) => acc + (a.score / a.total), 0);
  const avgQuizScore = quizAttempts.length > 0 ? Math.round((totalQuizScore / quizAttempts.length) * 100) : 0;
  
  const stats = [
    { label: "Courses\nCompleted", value: completedCoursesCount.toString() },
    { label: "Avg Quiz\nScore", value: `${avgQuizScore}%` },
    { label: "Certificates\nEarned", value: (profile.certificates || 0).toString() },
  ];

  const badges = [
    { title: "Flood Expert", icon: Waves },
    { title: "Rapid Responder", icon: Zap },
    { title: "Safety First", icon: ShieldCheck },
  ];

  const menuItems = [
    { label: "Edit Profile", icon: Pencil, href: "/user/profile/edit" },
    { label: "My Certificates", icon: Award, onClick: () => alert("Mock: Open certificates modal") },
    { label: "Account Settings", icon: Users, onClick: () => alert("Mock: Open settings modal") },
    { label: "Help & Support", icon: HelpCircle, onClick: () => alert("Mock: Open help center") },
  ];

  return (
    <section className="space-y-4 animate-[fadeIn_0.5s_ease-out]">
      {/* Identity card */}
      <div className="flex flex-col items-center rounded-3xl border border-[#E5E7EB] bg-white p-6 text-center shadow-sm">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#F3F4F6]">
            {profile.avatar ? (
               <img src={profile.avatar} alt="Profile" className="h-full w-full object-cover" />
            ) : (
               <Users size={32} className="text-[#9CA3AF]" />
            )}
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#10B981] text-white">
            <CheckCircle2 size={12} />
          </span>
        </div>
        <p className="mt-4 text-lg font-bold text-[#111827]">{profile.name}</p>
        <p className="text-sm text-[#6B7280]">{profile.email}</p>
        <span className="mt-3 rounded-full bg-[#D1FAE5] px-3 py-1 text-xs font-semibold text-[#047857]">
          Verified Responder
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-[#E5E7EB] bg-white p-4 text-center shadow-sm">
            <p className="text-xl font-bold text-[#10B981]">{stat.value}</p>
            <p className="mt-1 whitespace-pre-line text-xs leading-tight text-[#6B7280]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Learning progress */}
      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <p className="text-lg font-bold text-[#111827]">Learning Progress</p>
        <div className="mt-4 space-y-4">
          {courses.filter(c => c.progress > 0).length === 0 ? (
             <p className="text-sm text-[#6B7280] text-center italic py-2">No active courses yet.</p>
          ) : (
             courses.filter(c => c.progress > 0).map((course) => {
              const Icon = getIcon(course.category);
              return (
                <div key={course.slug}>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-medium text-[#111827]">
                      <Icon size={14} className="text-[#6B7280]" />
                      {course.title}
                    </span>
                    <span className="text-xs font-semibold text-[#10B981]">{course.progress}%</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-[#F3F4F6]">
                    <div className="h-1.5 rounded-full bg-[#10B981]" style={{ width: `${course.progress}%` }} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <p className="text-lg font-bold text-[#111827]">My Badges</p>
        <div className="mt-4 flex gap-5 overflow-x-auto pb-1 no-scrollbar">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div key={badge.title} className="flex shrink-0 flex-col items-center gap-2">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#10B981] text-white">
                  <Icon size={22} />
                </span>
                <p className="w-16 text-center text-xs font-medium leading-tight text-[#111827]">{badge.title}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Menu */}
      <div className="divide-y divide-[#E5E7EB] rounded-3xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const content = (
            <>
              <span className="flex items-center gap-3 text-sm font-medium text-[#111827]">
                <Icon size={18} className="text-[#6B7280]" />
                {item.label}
              </span>
              <ChevronRight size={16} className="text-[#9CA3AF]" />
            </>
          );
          
          if (item.href) {
            return (
              <Link key={item.label} href={item.href} className="flex items-center justify-between p-4 transition hover:bg-[#F9FAFB]">
                {content}
              </Link>
            );
          }
          
          return (
            <button key={item.label} onClick={item.onClick} className="w-full flex items-center justify-between p-4 transition hover:bg-[#F9FAFB] text-left">
              {content}
            </button>
          );
        })}
        <button 
          onClick={() => {
            document.cookie = "role=; Max-Age=0; path=/;";
            window.location.href = "/login";
          }}
          className="flex w-full items-center gap-3 p-4 text-left text-sm font-medium text-[#DC2626] transition hover:bg-[#FEF2F2]"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </section>
  );
}