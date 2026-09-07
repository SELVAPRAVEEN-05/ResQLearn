"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { CheckCircle2, PlayCircle, Lock, Play, ArrowLeft, RotateCw, BookOpen, Clock, FileVideo, FileText, Globe, File, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { getCourse, CourseItem } from "@/lib/api/courses";

const getMaterialIcon = (type: string) => {
  switch (type?.toUpperCase()) {
    case "VIDEO":
      return <FileVideo className="text-[#3B82F6]" size={14} />;
    case "PDF":
      return <FileText className="text-[#EF4444]" size={14} />;
    case "IMAGE":
      return <ImageIcon className="text-[#10B981]" size={14} />;
    case "WEBSITE":
    case "ARTICLE":
      return <Globe className="text-[#8B5CF6]" size={14} />;
    default:
      return <File className="text-[#6B7280]" size={14} />;
  }
};

export default function CourseDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = use(props.params);
  const router = useRouter();

  const [course, setCourse] = useState<CourseItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      setLoading(true);
      const res = await getCourse(params.slug);
      if (res.course) {
        setCourse(res.course);
      } else {
        setError(res.error || "Course not found");
      }
      setLoading(false);
    };

    fetchCourseDetails();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <RotateCw size={28} className="animate-spin text-[#10B981] mb-2" />
        <p className="text-sm font-semibold text-[#111827]">Loading course modules...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <p className="text-[#6B7280] text-sm">{error || "Course not found."}</p>
        <button
          onClick={() => router.push("/user/learn")}
          className="text-[#10B981] font-semibold text-xs flex items-center gap-1.5 hover:underline"
        >
          <ArrowLeft size={16} /> Back to Courses
        </button>
      </div>
    );
  }

  const lessons = course.lessons || [];
  const inProgressLesson = lessons.find((l) => l.status === "in-progress") || lessons.find((l) => l.status === "locked");
  const firstAvailableLesson = lessons.find((l) => l.status !== "completed") || lessons[0];
  const progress = course.progress ?? 0;

  return (
    <section className="space-y-6 animate-[fadeIn_0.5s_ease-out] pb-12">
      {/* Back Button */}
      <Link
        href="/user/learn"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#111827]"
      >
        <ArrowLeft size={14} /> Back to Learn
      </Link>

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#064E3B] to-[#10B981] p-6 text-white shadow-md">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold backdrop-blur-xs">
              {course.disasterType || (course as any).category}
            </span>
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold">
              {course.difficulty || "Beginner"}
            </span>
            <span className="text-xs font-semibold text-white/80 flex items-center gap-1">
              <Clock size={12} /> {course.estimatedDuration || course.duration || "30 min"}
            </span>
          </div>

          <h1 className="text-2xl font-black">{course.title}</h1>
          <p className="text-sm leading-relaxed text-white/90 max-w-xl">{course.description}</p>
        </div>
      </div>

      {/* Progress Card */}
      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6B7280]">Course Progress</p>
          <p className="text-xl font-black text-[#10B981]">{progress}%</p>
        </div>
        <div className="mt-3 h-2 rounded-full bg-[#F3F4F6] overflow-hidden">
          <div
            className="h-2 rounded-full bg-[#10B981] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Lessons List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-[#111827]">Syllabus & Lessons</h2>
          <span className="text-xs text-[#6B7280] font-semibold">{lessons.length} Modules</span>
        </div>

        <div className="divide-y divide-[#E5E7EB] rounded-3xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
          {lessons.map((lesson, i) => {
            const locked = lesson.status === "locked";
            const inProgress = lesson.status === "in-progress";
            const completed = lesson.status === "completed";

            const lessonContent = (
              <div
                className={`flex items-start gap-3 p-4 transition ${
                  inProgress ? "border-l-4 border-[#10B981] bg-[#F0FDF4]" : "hover:bg-[#F9FAFB]"
                }`}
              >
                {completed && (
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#10B981] text-white">
                    <CheckCircle2 size={16} />
                  </span>
                )}
                {inProgress && (
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[#10B981] text-[#10B981]">
                    <PlayCircle size={16} />
                  </span>
                )}
                {locked && (
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-[#9CA3AF]">
                    <Lock size={14} />
                  </span>
                )}

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p
                      className={`text-sm font-bold ${
                        inProgress ? "text-[#10B981]" : locked ? "text-[#9CA3AF]" : "text-[#111827]"
                      }`}
                    >
                      {i + 1}. {lesson.title}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        completed
                          ? "bg-[#D1FAE5] text-[#047857]"
                          : inProgress
                          ? "bg-[#10B981]/10 text-[#10B981]"
                          : "bg-[#F3F4F6] text-[#9CA3AF]"
                      }`}
                    >
                      {completed ? "Completed" : inProgress ? "In Progress" : "Locked"}
                    </span>
                  </div>

                  {lesson.description && (
                    <p className={`text-xs ${locked ? "text-[#9CA3AF]" : "text-[#6B7280]"}`}>
                      {lesson.description}
                    </p>
                  )}

                  {lesson.materials && lesson.materials.length > 0 && !locked && (
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {lesson.materials.map((m) => (
                        <span
                          key={m.id}
                          className="inline-flex items-center gap-1 rounded-md bg-[#F3F4F6] px-2 py-0.5 text-[10px] font-semibold text-[#4B5563]"
                        >
                          {getMaterialIcon(m.type)}
                          <span className="truncate max-w-[150px]">{m.title}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );

            return locked ? (
              <div key={lesson.id} className="cursor-not-allowed opacity-60">
                {lessonContent}
              </div>
            ) : (
              <Link key={lesson.id} href={`/user/learn/${course.slug}/lessons/${lesson.id}`}>
                {lessonContent}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Action Button */}
      {firstAvailableLesson && progress < 100 && (
        <Link
          href={`/user/learn/${course.slug}/lessons/${firstAvailableLesson.id}`}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#10B981] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[#0E9F72] shadow-sm active:scale-98"
        >
          <Play size={16} /> {progress > 0 ? "Continue Learning" : "Start Course"}
        </Link>
      )}

      {progress === 100 && (
        <div className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#10B981] bg-[#ECFDF5] px-4 py-3.5 text-sm font-bold text-[#10B981]">
          <CheckCircle2 size={18} /> Course Completed! All modules mastered.
        </div>
      )}
    </section>
  );
}
