"use client";

import Link from "next/link";
import { Search, Droplet, Wind, Activity, Flame, BookOpen, Clock } from "lucide-react";
import { useMockData } from "@/contexts/MockDataContext";
import { useState } from "react";

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'Droplet': return Droplet;
    case 'Wind': return Wind;
    case 'Activity': return Activity;
    case 'Flame': return Flame;
    default: return Droplet;
  }
};

const categories = ["All", "Flood", "Cyclone", "Earthquake", "Fire"];

export default function LearnPage() {
  const { courses } = useMockData();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredCourses = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                          c.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">Learn Disaster Preparedness</h1>
        <p className="mt-1 text-sm leading-6 text-[#6B7280]">
          Equip yourself with critical knowledge to handle emergencies effectively.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for disaster preparedness topics..."
          className="w-full rounded-2xl border border-[#E5E7EB] bg-white py-3 pl-10 pr-4 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#10B981]/30"
        />
      </div>

      {/* Categories */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">Categories</p>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={
                selectedCategory === cat
                  ? "flex shrink-0 items-center gap-1.5 rounded-full bg-[#10B981] px-4 py-2 text-sm font-semibold text-white"
                  : "flex shrink-0 items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#6B7280]"
              }
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured courses */}
      <div>
        <h2 className="text-lg font-bold text-[#111827]">Courses</h2>
        <div className="mt-3 space-y-3">
          {filteredCourses.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#D1D5DB] p-8 text-center bg-white">
              <BookOpen size={32} className="mx-auto text-[#9CA3AF] mb-3" />
              <h3 className="text-sm font-bold text-[#111827]">No courses found</h3>
              <p className="text-xs text-[#6B7280] mt-1">Explore our disaster preparedness courses or adjust your search.</p>
            </div>
          ) : (
            filteredCourses.map((course) => {
              const Icon = getIcon(course.iconName);
              const started = course.progress > 0;
              return (
                <div key={course.slug} className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F3F4F6] text-[#10B981]">
                      <Icon size={18} />
                    </span>
                    {course.progress === 100 ? (
                      <span className="rounded-full bg-[#D1FAE5] px-3 py-1 text-xs font-semibold text-[#047857]">
                        Completed
                      </span>
                    ) : started ? (
                      <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-semibold text-[#6B7280]">
                        In Progress
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-4 text-lg font-semibold text-[#111827]">{course.title}</p>
                  <p className="mt-1 text-sm leading-6 text-[#6B7280]">{course.description}</p>

                  <div className="mt-3 flex items-center gap-4 text-xs text-[#6B7280]">
                    <span className="flex items-center gap-1">
                      <BookOpen size={13} /> {course.lessons.length} Lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} /> {course.duration}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="font-medium text-[#6B7280]">Progress</span>
                    <span className={course.progress > 0 ? "font-semibold text-[#10B981]" : "font-semibold text-[#9CA3AF]"}>
                      {course.progress}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-[#F3F4F6]">
                    <div className="h-2 rounded-full bg-[#10B981]" style={{ width: `${course.progress}%` }} />
                  </div>

                  <Link
                    href={`/user/learn/${course.slug}`}
                    className={
                      course.progress === 100
                        ? "mt-5 flex w-full items-center justify-center rounded-2xl border border-[#10B981] bg-white px-4 py-3 text-sm font-semibold text-[#10B981] transition hover:bg-[#F0FDF4]"
                        : started
                        ? "mt-5 flex w-full items-center justify-center rounded-2xl bg-[#10B981] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0E9F72]"
                        : "mt-5 flex w-full items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
                    }
                  >
                    {course.progress === 100 ? "Review Course" : started ? "Continue Learning" : "Start Course"}
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}