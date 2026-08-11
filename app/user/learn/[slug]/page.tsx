import Link from "next/link";
import { CheckCircle2, PlayCircle, Lock, Play } from "lucide-react";

const lessons = [
  { id: "intro-to-floods", title: "Introduction to Floods", status: "completed" },
  { id: "causes-warning-signs", title: "Causes & Warning Signs", status: "completed" },
  { id: "preparing-your-home", title: "Preparing Your Home", status: "completed" },
  { id: "emergency-kit-checklist", title: "Emergency Kit Checklist", status: "completed" },
  { id: "during-a-flood", title: "What To Do During a Flood", status: "in-progress" },
  { id: "evacuation-safety", title: "Evacuation & Safety", status: "locked" },
  { id: "recovery-aftermath", title: "Recovery & Aftermath", status: "locked" },
];

export default function CourseDetailPage(props: { params: any }) {
  const { params } = props;
  const inProgressLesson = lessons.find((l) => l.status === "in-progress");

  return (
    <section className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#D1FAE5] to-[#A7F3D0]">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="relative flex h-52 flex-col justify-end p-5">
          <span className="mb-2 w-fit rounded-full bg-[#10B981] px-3 py-1 text-xs font-semibold text-white">
            Course
          </span>
          <h1 className="text-xl font-bold text-white">Flood Preparedness</h1>
          <p className="mt-1 text-sm leading-5 text-white/90">
            This course covers essential steps for before, during, and after a flood. Verified by disaster
            management experts.
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">Course Progress</p>
          <p className="text-xl font-bold text-[#10B981]">72%</p>
        </div>
        <div className="mt-3 h-2 rounded-full bg-[#F3F4F6]">
          <div className="h-2 rounded-full bg-[#10B981]" style={{ width: "72%" }} />
        </div>
      </div>

      {/* Lessons */}
      <div>
        <h2 className="text-lg font-bold text-[#111827]">Lessons</h2>
        <div className="mt-3 divide-y divide-[#E5E7EB] rounded-3xl border border-[#E5E7EB] bg-white shadow-sm">
          {lessons.map((lesson, i) => {
            const locked = lesson.status === "locked";
            const inProgress = lesson.status === "in-progress";
            const content = (
              <div
                className={
                  inProgress
                    ? "flex items-center gap-3 border-l-4 border-[#10B981] bg-[#F0FDF4] p-4"
                    : "flex items-center gap-3 p-4"
                }
              >
                {lesson.status === "completed" && (
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
                    {lesson.status === "completed" ? "Completed" : inProgress ? "In Progress" : "Locked"}
                  </p>
                </div>
              </div>
            );

            return locked ? (
              <div key={lesson.id} className="cursor-not-allowed">
                {content}
              </div>
            ) : (
              <Link key={lesson.id} href={`/user/learn/${params.slug}/lessons/${lesson.id}`}>
                {content}
              </Link>
            );
          })}
        </div>
      </div>

      {inProgressLesson && (
        <Link
          href={`/user/learn/${params.slug}/lessons/${inProgressLesson.id}`}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#10B981] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0E9F72]"
        >
          <Play size={16} /> Continue Learning
        </Link>
      )}
    </section>
  );
}
