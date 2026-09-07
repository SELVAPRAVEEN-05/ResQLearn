"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Droplet, Wind, Activity, Flame, BookOpen, Clock, RotateCw, Shield, Sun } from "lucide-react";
import { getCourses, CourseItem } from "@/lib/api/courses";

const getCategoryIcon = (disasterType: string, iconName?: string) => {
  const t = disasterType ? disasterType.toLowerCase() : "";
  if (t.includes("flood") || iconName === "Droplet") return Droplet;
  if (t.includes("fire") || iconName === "Flame") return Flame;
  if (t.includes("cyclone") || iconName === "Wind" || iconName === "Zap") return Wind;
  if (t.includes("earthquake") || iconName === "Activity") return Activity;
  if (t.includes("heatwave") || iconName === "Sun") return Sun;
  return Shield;
};

const categories = [
  "All",
  "Flood",
  "Fire",
  "Cyclone",
  "Heatwave",
  "Earthquake",
  "Landslide",
  "Drought",
  "Tsunami",
  "Other",
];

export default function LearnPage() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchCoursesList = async () => {
      setLoading(true);
      const res = await getCourses(selectedCategory !== "All" ? selectedCategory : undefined);
      if (res.courses) {
        setCourses(res.courses);
      }
      setLoading(false);
    };

    fetchCoursesList();
  }, [selectedCategory]);

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      (c.disasterType && c.disasterType.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategory === "All" ||
      (c.disasterType && c.disasterType.toLowerCase() === selectedCategory.toLowerCase()) ||
      ((c as any).category && (c as any).category.toLowerCase() === selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <section className="space-y-6 animate-[fadeIn_0.5s_ease-out] pb-10">
      <div>
        <h1 className="text-2xl font-black text-[#111827]">Learn Disaster Preparedness</h1>
        <p className="mt-1 text-sm leading-6 text-[#6B7280]">
          Equip yourself with verified, life-saving knowledge and interactive emergency protocols.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses, lessons, and emergency topics..."
          className="w-full rounded-2xl border border-[#E5E7EB] bg-white py-3 pl-10 pr-4 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#10B981] focus:outline-none focus:ring-2 focus:ring-[#10B981]/30 shadow-xs"
        />
      </div>

      {/* Categories Filter Tabs */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6B7280]">Disaster Categories</p>
        <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={
                selectedCategory === cat
                  ? "flex shrink-0 items-center gap-1.5 rounded-full bg-[#10B981] px-4 py-2 text-xs font-bold text-white shadow-xs transition"
                  : "flex shrink-0 items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-semibold text-[#6B7280] transition hover:border-[#D1D5DB] hover:text-[#111827]"
              }
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Courses List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-[#111827]">Available Courses</h2>
          <span className="text-xs text-[#6B7280] font-semibold">{filteredCourses.length} Courses</span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-[#E5E7EB] bg-white p-12 text-center shadow-xs">
            <RotateCw size={28} className="animate-spin text-[#10B981] mb-2" />
            <p className="text-sm font-semibold text-[#111827]">Loading courses from database...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#D1D5DB] p-10 text-center bg-white">
            <BookOpen size={36} className="mx-auto text-[#9CA3AF] mb-3" />
            <h3 className="text-base font-bold text-[#111827]">No courses available yet.</h3>
            <p className="text-xs text-[#6B7280] mt-1 max-w-sm mx-auto">
              There are no published courses matching your search or category filter. Check back soon for new modules.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCourses.map((course) => {
              const disaster = course.disasterType || (course as any).category || "Disaster";
              const Icon = getCategoryIcon(disaster, course.iconName);
              const progress = course.progress ?? 0;
              const started = progress > 0;
              const lessonCount = course.lessonCount ?? course.lessons?.length ?? 0;

              return (
                <div
                  key={course.id || course.slug}
                  className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F3F4F6] text-[#10B981]">
                        <Icon size={20} />
                      </span>
                      <div>
                        <span className="rounded-full bg-[#10B981]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#10B981]">
                          {disaster}
                        </span>
                        <span className="ml-1.5 rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[10px] font-bold text-[#4B5563]">
                          {course.difficulty || "Beginner"}
                        </span>
                      </div>
                    </div>

                    {progress === 100 ? (
                      <span className="rounded-full bg-[#D1FAE5] px-3 py-1 text-xs font-bold text-[#047857]">
                        Completed
                      </span>
                    ) : started ? (
                      <span className="rounded-full bg-[#FEF3C7] px-3 py-1 text-xs font-bold text-[#B45309]">
                        In Progress
                      </span>
                    ) : null}
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-[#111827]">{course.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#6B7280] line-clamp-2">{course.description}</p>

                  <div className="mt-3 flex items-center gap-4 text-xs text-[#6B7280]">
                    <span className="flex items-center gap-1 font-semibold text-[#374151]">
                      <BookOpen size={13} className="text-[#10B981]" /> {lessonCount} Lessons
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-[#374151]">
                      <Clock size={13} className="text-[#10B981]" /> {course.estimatedDuration || course.duration || "30 min"}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#6B7280]">Progress</span>
                    <span className={progress > 0 ? "font-bold text-[#10B981]" : "font-semibold text-[#9CA3AF]"}>
                      {progress}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-[#F3F4F6] overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-[#10B981] transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <Link
                    href={`/user/learn/${course.slug}`}
                    className={
                      progress === 100
                        ? "mt-5 flex w-full items-center justify-center rounded-2xl border border-[#10B981] bg-white px-4 py-3 text-sm font-bold text-[#10B981] transition hover:bg-[#F0FDF4]"
                        : started
                        ? "mt-5 flex w-full items-center justify-center rounded-2xl bg-[#10B981] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0E9F72] shadow-xs"
                        : "mt-5 flex w-full items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-bold text-[#111827] transition hover:bg-[#F9FAFB]"
                    }
                  >
                    {progress === 100 ? "Review Course" : started ? "Continue Learning" : "Start Course"}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}