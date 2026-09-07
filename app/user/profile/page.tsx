"use client";

import { useEffect, useState } from "react";
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
  Sun,
  RotateCw
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const getIcon = (category?: string) => {
  const c = category ? category.toLowerCase() : "";
  if (c.includes("flood")) return Droplet;
  if (c.includes("cyclone") || c.includes("wind")) return Zap;
  if (c.includes("earthquake") || c.includes("seismic")) return Mountain;
  if (c.includes("fire")) return Flame;
  return Sun;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>({ name: "Student", email: "" });
  const [courses, setCourses] = useState<any[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCertificates, setShowCertificates] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      try {
        const [dashRes, profRes] = await Promise.all([
          fetch("/api/user/dashboard").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/user/profile").then((r) => (r.ok ? r.json() : null)),
        ]);

        if (profRes?.profile) {
          setProfile(profRes.profile);
        } else if (dashRes?.profile) {
          setProfile(dashRes.profile);
        }

        if (dashRes?.courses) {
          setCourses(dashRes.courses);
        }

        if (dashRes?.recentAttempts) {
          setQuizAttempts(dashRes.recentAttempts);
        }
      } catch (e) {
        console.error("Profile load error:", e);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <RotateCw size={28} className="animate-spin text-[#10B981] mb-2" />
        <p className="text-sm font-semibold text-[#111827]">Loading student profile...</p>
      </div>
    );
  }

  const completedCoursesCount = courses.filter((c) => Number(c.progress) === 100).length;
  const totalAttempts = quizAttempts.length;
  const avgQuizScore =
    totalAttempts > 0
      ? Math.round((quizAttempts.reduce((acc, a) => acc + a.score / (a.total || 1), 0) / totalAttempts) * 100)
      : 0;

  const stats = [
    { label: "Courses\nCompleted", value: completedCoursesCount.toString() },
    { label: "Avg Quiz\nScore", value: `${avgQuizScore}%` },
    { label: "Certificates\nEarned", value: (profile.certificates || completedCoursesCount || 0).toString() },
  ];

  const badges = [
    { title: "Preparedness Starter", icon: ShieldCheck },
    { title: "Rapid Responder", icon: Zap },
    { title: "Certified Responder", icon: Waves },
  ];

  const menuItems = [
    { label: "Edit Profile", icon: Pencil, href: "/user/profile/edit" },
    { label: "My Certificates", icon: Award, onClick: () => setShowCertificates(true) },
    { label: "Account Settings", icon: Users, href: "/user/profile/edit" },
    { label: "Emergency Assistant", icon: HelpCircle, href: "/user/assistant" },
  ];

  return (
    <section className="space-y-4 animate-[fadeIn_0.5s_ease-out] pb-10">
      {/* Identity Card */}
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
        <div className="mt-3 flex items-center gap-2">
          <span className="rounded-full bg-[#D1FAE5] px-3 py-1 text-xs font-bold text-[#047857]">
            Score: {profile.preparedness_score || 0}/100
          </span>
          {profile.institution && (
            <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-semibold text-[#4B5563]">
              {profile.institution}
            </span>
          )}
        </div>
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

      {/* Learning Progress */}
      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <p className="text-lg font-bold text-[#111827]">Learning Progress</p>
        <div className="mt-4 space-y-4">
          {courses.filter((c) => Number(c.progress) > 0).length === 0 ? (
            <p className="text-sm text-[#6B7280] text-center italic py-2">No active courses yet.</p>
          ) : (
            courses
              .filter((c) => Number(c.progress) > 0)
              .map((course) => {
                const Icon = getIcon(course.category || course.disasterType);
                return (
                  <div key={course.slug}>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-semibold text-[#111827]">
                        <Icon size={14} className="text-[#6B7280]" />
                        {course.title}
                      </span>
                      <span className="text-xs font-bold text-[#10B981]">{course.progress}%</span>
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
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#10B981] text-white shadow-xs">
                  <Icon size={22} />
                </span>
                <p className="w-16 text-center text-xs font-medium leading-tight text-[#111827]">{badge.title}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Menu list */}
      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-2 shadow-sm">
        {menuItems.map((item) => {
          const Icon = item.icon;
          if (item.href) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-between rounded-2xl p-3.5 transition hover:bg-[#F9FAFB]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F4F6]">
                    <Icon size={16} className="text-[#111827]" />
                  </span>
                  <p className="text-sm font-semibold text-[#111827]">{item.label}</p>
                </div>
                <ChevronRight size={16} className="text-[#9CA3AF]" />
              </Link>
            );
          }

          return (
            <button
              key={item.label}
              onClick={item.onClick}
              className="flex w-full items-center justify-between rounded-2xl p-3.5 transition hover:bg-[#F9FAFB]"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F4F6]">
                  <Icon size={16} className="text-[#111827]" />
                </span>
                <p className="text-sm font-semibold text-[#111827]">{item.label}</p>
              </div>
              <ChevronRight size={16} className="text-[#9CA3AF]" />
            </button>
          );
        })}

        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-between rounded-2xl p-3.5 text-[#DC2626] transition hover:bg-[#FEE2E2]/40"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FEE2E2]">
              <LogOut size={16} className="text-[#DC2626]" />
            </span>
            <p className="text-sm font-bold">Log Out</p>
          </div>
          <ChevronRight size={16} className="text-[#DC2626]" />
        </button>
      </div>

      {/* Certificates Modal */}
      {showCertificates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4 text-center border-4 border-[#10B981]/20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ECFDF5] text-[#10B981]">
              <Award size={36} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#10B981]">Official Certifications</span>
              <h2 className="text-xl font-black text-[#111827] mt-1">SafeGraph Emergency Competency</h2>
            </div>

            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 text-xs text-[#374151] space-y-1 text-left">
              <p className="font-bold text-[#111827]">{profile.name}</p>
              <p className="text-[#6B7280]">Completed Courses: {completedCoursesCount}</p>
              <p className="text-[#6B7280]">Total Score: {profile.preparedness_score || 0}/100</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 rounded-2xl bg-[#10B981] py-3 text-sm font-bold text-white hover:bg-[#0E9F72] transition"
              >
                Print / Save
              </button>
              <button
                onClick={() => setShowCertificates(false)}
                className="flex-1 rounded-2xl border border-[#E5E7EB] bg-white py-3 text-sm font-semibold text-[#6B7280] hover:bg-[#F3F4F6] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}