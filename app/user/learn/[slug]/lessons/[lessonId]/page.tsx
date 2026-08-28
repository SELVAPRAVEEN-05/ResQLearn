"use client";

import Link from "next/link";
import { CheckCircle2, ArrowLeft, ArrowRight, BookOpen, Video, Image as ImageIcon } from "lucide-react";
import { useMockData } from "@/contexts/MockDataContext";
import { useRouter } from "next/navigation";
import { use } from "react";

export default function LessonPage(props: { params: Promise<{ slug: string; lessonId: string }> }) {
  const params = use(props.params);
  const { courses, markLessonComplete } = useMockData();
  const router = useRouter();

  const course = courses.find(c => c.slug === params.slug);
  const lessonIndex = course?.lessons.findIndex(l => l.id === params.lessonId) ?? -1;
  const lesson = course?.lessons[lessonIndex];

  if (!course || !lesson) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
        <p className="text-[#6B7280]">Lesson not found.</p>
        <button onClick={() => router.back()} className="text-[#10B981] font-semibold flex items-center gap-2">
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  const prevLesson = lessonIndex > 0 ? course.lessons[lessonIndex - 1] : null;
  const nextLesson = lessonIndex < course.lessons.length - 1 ? course.lessons[lessonIndex + 1] : null;

  const handleComplete = () => {
    markLessonComplete(course.slug, lesson.id);
    if (nextLesson) {
      router.push(`/user/learn/${course.slug}/lessons/${nextLesson.id}`);
    } else {
      router.push(`/user/learn/${course.slug}`);
    }
  };

  const getIcon = () => {
    switch (lesson.type) {
      case "video": return <Video size={20} className="text-[#10B981]" />;
      case "image": return <ImageIcon size={20} className="text-[#10B981]" />;
      default: return <BookOpen size={20} className="text-[#10B981]" />;
    }
  };

  return (
    <section className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      {/* Breadcrumb */}
      <Link href={`/user/learn/${course.slug}`} className="text-xs font-medium text-[#6B7280] hover:text-[#111827] flex items-center gap-1 w-fit">
        <ArrowLeft size={12} /> Back to Course
      </Link>

      <div>
        <div className="flex items-center gap-2 mb-2">
          {getIcon()}
          <span className="text-xs font-semibold uppercase tracking-wider text-[#10B981]">
            {lesson.type}
          </span>
        </div>
        <h1 className="text-xl font-bold text-[#111827]">{lesson.title}</h1>
      </div>

      {/* Lesson Content */}
      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm min-h-[250px]">
        {lesson.type === "video" && (
          <div className="w-full aspect-video bg-[#111827] rounded-xl flex items-center justify-center mb-6">
            <PlayCircle size={48} className="text-white/50" />
          </div>
        )}
        
        {lesson.type === "image" && (
          <div className="w-full h-48 bg-gradient-to-br from-[#D1FAE5] to-[#ECFDF5] rounded-xl flex items-center justify-center mb-6 border border-[#E5E7EB]">
            <ImageIcon size={48} className="text-[#10B981]/50" />
          </div>
        )}

        <div className="prose prose-sm prose-gray max-w-none text-[#374151] leading-relaxed">
          <p>{lesson.content}</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="space-y-3 pt-4 border-t border-[#E5E7EB]">
        {lesson.status !== "completed" && (
          <button 
            onClick={handleComplete}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#10B981] bg-[#ECFDF5] px-4 py-3 text-sm font-semibold text-[#10B981] transition hover:bg-[#D1FAE5]"
          >
            <CheckCircle2 size={16} /> Mark as Complete
          </button>
        )}
        
        <div className="flex gap-3">
          {prevLesson && (
            <Link 
              href={`/user/learn/${course.slug}/lessons/${prevLesson.id}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
            >
              <ArrowLeft size={16} /> Previous
            </Link>
          )}
          
          {nextLesson ? (
            <Link 
              href={`/user/learn/${course.slug}/lessons/${nextLesson.id}`}
              className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                nextLesson.status === "locked" 
                  ? "bg-[#F3F4F6] text-[#9CA3AF] pointer-events-none" 
                  : "bg-[#10B981] text-white hover:bg-[#0E9F72]"
              }`}
              onClick={(e) => nextLesson.status === "locked" && e.preventDefault()}
            >
              Next <ArrowRight size={16} />
            </Link>
          ) : (
            <Link 
              href={`/user/learn/${course.slug}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#10B981] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0E9F72]"
            >
              <CheckCircle2 size={16} /> Finish Course
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

// Ensure PlayCircle is imported from lucide-react if needed, adding it:
import { PlayCircle } from "lucide-react";
