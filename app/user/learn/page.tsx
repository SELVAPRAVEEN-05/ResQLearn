import Link from "next/link";
import { Search, Droplet, Wind, Activity, Flame, BookOpen, Clock } from "lucide-react";

const categories = [
  { label: "Flood", icon: Droplet, active: true },
  { label: "Cyclone", icon: Wind, active: false },
  { label: "Earthquake", icon: Activity, active: false },
];

const courses = [
  {
    slug: "flood-preparedness",
    title: "Flood Preparedness",
    description: "Learn how to secure your property and evacuate safely during rising waters.",
    icon: Droplet,
    lessons: 8,
    duration: "25 min",
    status: "In Progress",
    progress: 72,
  },
  {
    slug: "earthquake-safety",
    title: "Earthquake Safety",
    description: "Essential protocols for drop, cover, and hold on, plus structural assessment basics.",
    icon: Activity,
    lessons: 12,
    duration: "40 min",
    status: "Not Started",
    progress: 0,
  },
  {
    slug: "fire-prevention",
    title: "Fire Prevention",
    description: "Understand fire behavior, prevention strategies, and safe evacuation routes.",
    icon: Flame,
    lessons: 6,
    duration: "15 min",
    status: "Not Started",
    progress: 0,
  },
];

export default function LearnPage() {
  return (
    <section className="space-y-6">
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
          placeholder="Search for disaster preparedness topics..."
          className="w-full rounded-2xl border border-[#E5E7EB] bg-white py-3 pl-10 pr-4 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#10B981]/30"
        />
      </div>

      {/* Categories */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">Categories</p>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.label}
                className={
                  cat.active
                    ? "flex shrink-0 items-center gap-1.5 rounded-full bg-[#10B981] px-4 py-2 text-sm font-semibold text-white"
                    : "flex shrink-0 items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#6B7280]"
                }
              >
                <Icon size={14} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured courses */}
      <div>
        <h2 className="text-lg font-bold text-[#111827]">Featured Courses</h2>
        <div className="mt-3 space-y-3">
          {courses.map((course) => {
            const Icon = course.icon;
            const started = course.progress > 0;
            return (
              <div key={course.slug} className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F3F4F6] text-[#10B981]">
                    <Icon size={18} />
                  </span>
                  {started && (
                    <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-semibold text-[#6B7280]">
                      {course.status}
                    </span>
                  )}
                </div>

                <p className="mt-4 text-lg font-semibold text-[#111827]">{course.title}</p>
                <p className="mt-1 text-sm leading-6 text-[#6B7280]">{course.description}</p>

                <div className="mt-3 flex items-center gap-4 text-xs text-[#6B7280]">
                  <span className="flex items-center gap-1">
                    <BookOpen size={13} /> {course.lessons} Lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} /> {course.duration}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="font-medium text-[#6B7280]">Progress</span>
                  <span className={started ? "font-semibold text-[#10B981]" : "font-semibold text-[#9CA3AF]"}>
                    {course.progress}%
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-[#F3F4F6]">
                  <div className="h-2 rounded-full bg-[#10B981]" style={{ width: `${course.progress}%` }} />
                </div>

                <Link
                  href={`/user/learn/${course.slug}`}
                  className={
                    started
                      ? "mt-5 flex w-full items-center justify-center rounded-2xl bg-[#10B981] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0E9F72]"
                      : "mt-5 flex w-full items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
                  }
                >
                  {started ? "Continue Learning" : "Start Course"}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}