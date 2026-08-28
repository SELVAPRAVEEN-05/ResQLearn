"use client";

import Link from "next/link";
import { CheckCircle2, PlayCircle, Lock, Play, ArrowLeft } from "lucide-react";
import { useMockData } from "@/contexts/MockDataContext";
import { useRouter } from "next/navigation";
import { use } from "react";

export default function CourseDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = use(props.params);
  const { courses } = useMockData();
  const router = useRouter();
  
  const course = courses.find(c => c.slug === params.slug);

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
        <p className="text-[#6B7280]">Course not found.</p>
        <button onClick={() => router.back()} className="text-[#10B981] font-semibold flex items-center gap-2">
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  const inProgressLesson = course.lessons.find((l) => l.status === "in-progress") || course.lessons.find((l) => l.status === "locked");
  const firstLockedLesson = course.lessons.find((l) => l.status === "locked");
  const actionLesson = inProgressLesson || firstLockedLesson || course.lessons[course.lessons.length - 1]; // Fallback to last if all completed

  return (
    <section className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#D1FAE5] to-[#A7F3D0]">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="relative flex h-52 flex-col justify-end p-5">
          <span className="mb-2 w-fit rounded-full bg-[#10B981] px-3 py-1 text-xs font-semibold text-white">
            Course
          </span>
          <h1 className="text-xl font-bold text-white">{course.title}</h1>
          <p className="mt-1 text-sm leading-5 text-white/90">
            {course.description}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">Course Progress</p>
          <p className="text-xl font-bold text-[#10B981]">{course.progress}%</p>
        </div>
        <div className="mt-3 h-2 rounded-full bg-[#F3F4F6]">
          <div className="h-2 rounded-full bg-[#10B981]" style={{ width: `${course.progress}%` }} />
        </div>
      </div>

      {/* Lessons */}
      <div>
        <h2 className="text-lg font-bold text-[#111827]">Lessons</h2>
        <div className="mt-3 divide-y divide-[#E5E7EB] rounded-3xl border border-[#E5E7EB] bg-white shadow-sm">
          {course.lessons.map((lesson, i) => {
            const locked = lesson.status === "locked";
            const inProgress = lesson.status === "in-progress";
            const completed = lesson.status === "completed";
            
            const content = (
              <div
                className={
                  inProgress
                    ? "flex items-center gap-3 border-l-4 border-[#10B981] bg-[#F0FDF4] p-4"
                    : "flex items-center gap-3 p-4"
                }
              >
                {completed && (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#10B981] text-white">
                    <CheckCircle2 size={16} />
                  </span>
                )}
                {inProgress && (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#10B981] text-[#10B981]">
                    <PlayCircle size={16} />
                  </span>
                )}
                {locked && (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-[#9CA3AF]">
                    <Lock size={14} />
                  </span>
                )}
                <div>
                  <p className={
                    inProgress
                      ? "text-sm font-semibold text-[#10B981]"
                      : locked
                      ? "text-sm font-medium text-[#9CA3AF]"
                      : "text-sm font-medium text-[#111827]"
                  }>
                    {i + 1}. {lesson.title}
                  </p>
                  <p className={
                    inProgress
                      ? "text-xs font-medium text-[#10B981]"
                      : locked
                      ? "text-xs text-[#9CA3AF]"
                      : "text-xs text-[#6B7280]"
                  }>
                    {completed ? "Completed" : inProgress ? "In Progress" : "Locked"}
                  </p>
                </div>
              </div>
            );

            return locked ? (
              <div key={lesson.id} className="cursor-not-allowed opacity-60">
                {content}
              </div>
            ) : (
              <Link key={lesson.id} href={`/user/learn/${course.slug}/lessons/${lesson.id}`}>
                {content}
              </Link>
            );
          })}
        </div>
      </div>

      {actionLesson && course.progress < 100 && (
        <Link
          href={`/user/learn/${course.slug}/lessons/${actionLesson.id}`}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#10B981] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0E9F72]"
        >
          <Play size={16} /> {course.progress > 0 ? "Continue Learning" : "Start Course"}
        </Link>
      )}
      {course.progress === 100 && (
        <div className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#10B981] bg-[#ECFDF5] px-4 py-3 text-sm font-semibold text-[#10B981]">
          <CheckCircle2 size={16} /> Course Completed
        </div>
      )}
    </section>
  );
}
