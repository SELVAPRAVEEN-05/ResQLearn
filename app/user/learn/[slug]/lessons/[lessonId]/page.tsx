"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  FileVideo,
  FileText,
  Globe,
  ExternalLink,
  RotateCw,
  PlayCircle,
  File,
  ShieldCheck,
  Download,
  Maximize2,
  X,
  Play,
  RefreshCw,
  Image as ImageIcon
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getCourse, completeLesson, CourseItem, LessonItem, MaterialItem } from "@/lib/api/courses";
import { getYouTubeEmbedUrl, isPdfUrl } from "@/lib/validations/course";

const getMaterialBadge = (type: string) => {
  switch (type?.toUpperCase()) {
    case "VIDEO":
      return { icon: FileVideo, label: "VIDEO LESSON", color: "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]" };
    case "PDF":
      return { icon: FileText, label: "PDF GUIDE", color: "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]" };
    case "IMAGE":
      return { icon: ImageIcon, label: "IMAGE / DIAGRAM", color: "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]" };
    case "WEBSITE":
    case "ARTICLE":
      return { icon: Globe, label: "WEBSITE / ARTICLE", color: "bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]" };
    default:
      return { icon: File, label: "RESOURCE", color: "bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]" };
  }
};

export default function LessonPage(props: { params: Promise<{ slug: string; lessonId: string }> }) {
  const params = use(props.params);
  const router = useRouter();

  const [course, setCourse] = useState<CourseItem | null>(null);
  const [currentLesson, setCurrentLesson] = useState<LessonItem | null>(null);
  const [lessonIndex, setLessonIndex] = useState<number>(-1);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completedSuccess, setCompletedSuccess] = useState(false);

  // Granular material completion state
  const [materialCompletionMap, setMaterialCompletionMap] = useState<Record<number, boolean>>({});
  const [togglingMaterialId, setTogglingMaterialId] = useState<number | null>(null);

  // Active selected video material for video player
  const [activeVideoId, setActiveVideoId] = useState<number | string | null>(null);

  // Active selected PDF preview modal
  const [activeViewerModal, setActiveViewerModal] = useState<{
    isOpen: boolean;
    material: MaterialItem | null;
    viewerEngine: "native" | "google";
  }>({
    isOpen: false,
    material: null,
    viewerEngine: "native",
  });

  useEffect(() => {
    const fetchLessonData = async () => {
      setLoading(true);
      const res = await getCourse(params.slug);
      if (res.course && res.course.lessons) {
        setCourse(res.course);
        const idx = res.course.lessons.findIndex(
          (l) => String(l.id) === params.lessonId || l.lessonId === params.lessonId
        );
        if (idx !== -1) {
          setLessonIndex(idx);
          const lesson = res.course.lessons[idx];
          setCurrentLesson(lesson);

          // Fetch granular lesson progress with material statuses
          try {
            const lessonRes = await fetch(`/api/lessons/${lesson.id}`);
            if (lessonRes.ok) {
              const lData = await lessonRes.json();
              if (lData.lesson?.materials) {
                const map: Record<number, boolean> = {};
                lData.lesson.materials.forEach((m: any) => {
                  map[m.id] = !!m.completed;
                });
                setMaterialCompletionMap(map);
                if (lData.lesson.completed) {
                  setCompletedSuccess(true);
                }
              }
            }
          } catch (e) {
            console.error("Error fetching lesson progress:", e);
          }

          // Find first video material if present
          const firstVid = lesson.materials?.find((m) => m.type === "VIDEO");
          if (firstVid) {
            setActiveVideoId(firstVid.id);
          }
        }
      }
      setLoading(false);
    };

    fetchLessonData();
  }, [params.slug, params.lessonId]);

  const handleToggleMaterial = async (materialId: number) => {
    const currentCompleted = !!materialCompletionMap[materialId];
    const newStatus = !currentCompleted;
    setTogglingMaterialId(materialId);

    try {
      const res = await fetch(`/api/materials/${materialId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: newStatus, progressPercent: newStatus ? 100 : 0 }),
      });

      if (res.ok) {
        const data = await res.json();
        setMaterialCompletionMap((prev) => ({ ...prev, [materialId]: newStatus }));
        if (data.lessonCompleted) {
          setCompletedSuccess(true);
        }
      }
    } catch (e) {
      console.error("Failed to toggle material completion:", e);
    } finally {
      setTogglingMaterialId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <RotateCw size={28} className="animate-spin text-[#10B981] mb-2" />
        <p className="text-sm font-semibold text-[#111827]">Loading lesson content...</p>
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <p className="text-[#6B7280] text-sm">Lesson not found.</p>
        <button
          onClick={() => router.push(`/user/learn/${params.slug}`)}
          className="text-[#10B981] font-semibold text-xs flex items-center gap-1.5 hover:underline"
        >
          <ArrowLeft size={16} /> Back to Course
        </button>
      </div>
    );
  }

  const prevLesson = lessonIndex > 0 ? course.lessons![lessonIndex - 1] : null;
  const nextLesson = lessonIndex < course.lessons!.length - 1 ? course.lessons![lessonIndex + 1] : null;
  const isCompleted = currentLesson.status === "completed" || completedSuccess;

  const handleMarkComplete = async () => {
    setCompleting(true);
    const res = await completeLesson(course.slug, currentLesson.id);
    setCompleting(false);

    if (res.success) {
      setCompletedSuccess(true);
      if (nextLesson) {
        router.push(`/user/learn/${course.slug}/lessons/${nextLesson.id}`);
      } else {
        router.push(`/user/learn/${course.slug}`);
      }
    }
  };

  const videoMaterials = currentLesson.materials?.filter((m) => m.type === "VIDEO") || [];
  const selectedVideo =
    videoMaterials.find((v) => v.id === activeVideoId) || videoMaterials[0] || null;

  const selectedEmbedUrl = selectedVideo ? getYouTubeEmbedUrl(selectedVideo.url) : null;
  const isDirectVideo =
    selectedVideo &&
    (selectedVideo.url.endsWith(".mp4") ||
      selectedVideo.url.endsWith(".webm") ||
      selectedVideo.url.endsWith(".mov"));

  return (
    <section className="space-y-6 animate-[fadeIn_0.5s_ease-out] pb-16">
      {/* Breadcrumbs */}
      <Link
        href={`/user/learn/${course.slug}`}
        className="inline-flex items-center gap-1 text-xs font-semibold text-[#6B7280] hover:text-[#111827]"
      >
        <ArrowLeft size={13} /> Back to {course.title}
      </Link>

      {/* Lesson Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#10B981]/10 px-2.5 py-0.5 text-xs font-bold text-[#10B981]">
            Lesson {lessonIndex + 1} of {course.lessons?.length}
          </span>
          {isCompleted && (
            <span className="flex items-center gap-1 text-xs font-bold text-[#059669]">
              <CheckCircle2 size={14} /> Completed
            </span>
          )}
        </div>
        <h1 className="text-2xl font-black text-[#111827]">{currentLesson.title}</h1>
        {currentLesson.description && (
          <p className="text-sm text-[#6B7280] leading-relaxed">{currentLesson.description}</p>
        )}
      </div>

      {/* Embedded Video Player if present */}
      {selectedVideo && (
        <div id="lesson-video-player" className="overflow-hidden rounded-3xl border border-[#E5E7EB] bg-black shadow-lg">
          {selectedEmbedUrl ? (
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={selectedEmbedUrl}
                title={selectedVideo.title}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : isDirectVideo ? (
            <div className="relative aspect-video w-full bg-black flex items-center justify-center">
              <video
                src={selectedVideo.url}
                controls
                className="h-full w-full object-contain"
              />
            </div>
          ) : (
            <div className="p-8 text-center bg-[#111827] text-white space-y-3">
              <FileVideo size={42} className="mx-auto text-[#3B82F6]" />
              <h3 className="text-base font-bold">{selectedVideo.title}</h3>
              <p className="text-xs text-white/70 max-w-md mx-auto">
                {selectedVideo.description || "Click below to watch this educational video in full quality."}
              </p>
              <a
                href={selectedVideo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#3B82F6] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#2563EB] shadow-sm"
              >
                Watch Educational Video <ExternalLink size={14} />
              </a>
            </div>
          )}

          {/* Video Footer bar & Multi-Video Switcher */}
          <div className="p-3.5 bg-[#111827] text-white flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="rounded bg-[#3B82F6] px-2 py-0.5 text-[10px] font-bold uppercase">VIDEO</span>
              <span className="font-bold truncate max-w-md">{selectedVideo.title}</span>
            </div>

            <div className="flex items-center gap-2">
              {videoMaterials.length > 1 && (
                <div className="flex items-center gap-1.5 mr-2">
                  <span className="text-[11px] text-white/60">More Videos:</span>
                  {videoMaterials.map((vm, vIdx) => (
                    <button
                      key={vm.id}
                      onClick={() => setActiveVideoId(vm.id)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                        vm.id === selectedVideo.id
                          ? "bg-[#10B981] text-white"
                          : "bg-white/10 text-white/80 hover:bg-white/20"
                      }`}
                    >
                      Part {vIdx + 1}
                    </button>
                  ))}
                </div>
              )}

              <a
                href={selectedVideo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-lg bg-[#EF4444] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#DC2626] transition shadow-sm"
              >
                <Play size={11} className="fill-current" />
                <span>Watch on YouTube</span>
                <ExternalLink size={10} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Instructional Content Card */}
      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#F3F4F6] text-[#374151]">
          <BookOpen size={16} className="text-[#10B981]" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#111827]">Lesson Instructions & Protocol</h2>
        </div>

        <div className="prose prose-sm max-w-none text-[#374151] leading-relaxed whitespace-pre-line text-sm">
          {currentLesson.content}
        </div>
      </div>

      {/* Educational Materials & Resources Section */}
      {currentLesson.materials && currentLesson.materials.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#111827]">Educational Materials & Resources</h3>
            <span className="text-xs text-[#6B7280] font-semibold">{currentLesson.materials.length} Resources</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {currentLesson.materials.map((mat) => {
              const badge = getMaterialBadge(mat.type);
              const BadgeIcon = badge.icon;
              const isPdf = mat.type === "PDF" || isPdfUrl(mat.url);
              const isVid = mat.type === "VIDEO" || !!getYouTubeEmbedUrl(mat.url);

              const isMatCompleted = !!materialCompletionMap[mat.id as number];
              const isTogglingThis = togglingMaterialId === mat.id;

              return (
                <div
                  key={mat.id}
                  className={`flex flex-col justify-between rounded-3xl border p-5 shadow-sm transition hover:shadow-md ${
                    isMatCompleted ? "border-[#A7F3D0] bg-[#F0FDF4]/40" : "border-[#E5E7EB] bg-white"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${badge.color}`}
                      >
                        <BadgeIcon size={12} /> {badge.label}
                      </span>

                      {isMatCompleted && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-[#059669]">
                          <CheckCircle2 size={13} /> Completed
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-[#111827]">{mat.title}</h4>
                    {mat.description && <p className="text-xs text-[#6B7280] line-clamp-2">{mat.description}</p>}
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                      {isVid ? (
                        <>
                          <button
                            onClick={() => {
                              setActiveVideoId(mat.id);
                              const el = document.getElementById("lesson-video-player");
                              if (el) el.scrollIntoView({ behavior: "smooth" });
                            }}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] px-4 py-2.5 text-xs font-bold text-[#2563EB] transition hover:bg-[#DBEAFE]"
                          >
                            <Play size={14} />
                            <span>Play Video</span>
                          </button>
                          <a
                            href={mat.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2.5 text-xs font-semibold text-[#374151] hover:text-[#2563EB] hover:border-[#BFDBFE]"
                            title="Open on YouTube / External"
                          >
                            <span>YouTube</span>
                            <ExternalLink size={13} />
                          </a>
                        </>
                      ) : (
                        <>
                          <a
                            href={mat.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] px-4 py-2.5 text-xs font-bold text-[#15803D] transition hover:bg-[#DCFCE7]"
                          >
                            <span>Open Study Guide</span>
                            <ExternalLink size={13} />
                          </a>
                          {isPdf && (
                            <button
                              onClick={() => setActiveViewerModal({ isOpen: true, material: mat, viewerEngine: "google" })}
                              className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2.5 text-xs font-semibold text-[#6B7280] hover:text-[#111827] hover:border-[#10B981]"
                              title="Preview Guide"
                            >
                              <Maximize2 size={14} />
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    {/* Granular Mark as Completed Button */}
                    <button
                      onClick={() => handleToggleMaterial(mat.id as number)}
                      disabled={isTogglingThis}
                      className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold transition border ${
                        isMatCompleted
                          ? "border-[#BBF7D0] bg-[#ECFDF5] text-[#059669] hover:bg-[#D1FAE5]"
                          : "border-[#E5E7EB] bg-[#F9FAFB] text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]"
                      }`}
                    >
                      {isTogglingThis ? (
                        <RotateCw size={12} className="animate-spin text-[#10B981]" />
                      ) : isMatCompleted ? (
                        <>
                          <CheckCircle2 size={13} className="text-[#059669]" />
                          <span>Marked as Completed</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={13} className="text-[#9CA3AF]" />
                          <span>Mark as Completed</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Action / Completion Bar */}
      <div className="space-y-3 pt-4 border-t border-[#E5E7EB]">
        {!isCompleted ? (
          <button
            onClick={handleMarkComplete}
            disabled={completing}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#10B981] px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0E9F72] disabled:opacity-50 active:scale-98"
          >
            {completing ? (
              <>
                <RotateCw size={16} className="animate-spin" /> Saving Progress...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} /> Mark Lesson as Complete
              </>
            )}
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] px-4 py-3 text-sm font-bold text-[#059669]">
            <CheckCircle2 size={18} /> Lesson Completed (+2 Preparedness Score)
          </div>
        )}

        {/* Previous / Next Lesson Navigation */}
        <div className="flex gap-3">
          {prevLesson ? (
            <Link
              href={`/user/learn/${course.slug}/lessons/${prevLesson.id}`}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-xs font-bold text-[#374151] transition hover:bg-[#F9FAFB]"
            >
              <ArrowLeft size={14} /> Previous Lesson
            </Link>
          ) : (
            <div className="flex-1" />
          )}

          {nextLesson ? (
            <Link
              href={`/user/learn/${course.slug}/lessons/${nextLesson.id}`}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-[#111827] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#1F2937]"
            >
              Next Lesson <ArrowRight size={14} />
            </Link>
          ) : (
            <Link
              href={`/user/learn/${course.slug}`}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-[#10B981] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#0E9F72]"
            >
              Finish Course <CheckCircle2 size={14} />
            </Link>
          )}
        </div>
      </div>

      {/* In-App PDF / Document Viewer Modal */}
      {activeViewerModal.isOpen && activeViewerModal.material && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/65 p-2 sm:p-4 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
          <div className="flex h-full max-h-[95vh] w-full max-w-4xl flex-col rounded-3xl bg-white shadow-2xl overflow-hidden border border-[#E5E7EB]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#374151] bg-[#111827] px-5 py-3 text-white">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileText size={18} className="text-[#EF4444] shrink-0" />
                <span className="text-xs sm:text-sm font-bold truncate max-w-xs sm:max-w-md">
                  {activeViewerModal.material.title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Engine switch */}
                <button
                  onClick={() =>
                    setActiveViewerModal((prev) => ({
                      ...prev,
                      viewerEngine: prev.viewerEngine === "native" ? "google" : "native",
                    }))
                  }
                  className="hidden sm:inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/90 hover:bg-white/20 transition"
                  title="Switch PDF Reader Engine"
                >
                  <RefreshCw size={11} />
                  <span>{activeViewerModal.viewerEngine === "native" ? "Native Reader" : "Google Viewer"}</span>
                </button>

                <a
                  href={activeViewerModal.material.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg bg-[#10B981] px-3 py-1 text-xs font-bold text-white hover:bg-[#0E9F72] transition"
                >
                  <ExternalLink size={12} /> Open Official Link
                </a>

                <button
                  onClick={() => setActiveViewerModal({ isOpen: false, material: null, viewerEngine: "native" })}
                  className="rounded-full p-1 text-white/70 hover:bg-white/10 hover:text-white ml-1"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Viewer Content Frame */}
            <div className="flex-1 bg-[#262626] p-2 relative flex flex-col">
              {activeViewerModal.viewerEngine === "native" ? (
                <object
                  data={activeViewerModal.material.url}
                  type="application/pdf"
                  className="h-full w-full rounded-2xl bg-white"
                >
                  <iframe
                    src={activeViewerModal.material.url}
                    title={activeViewerModal.material.title}
                    className="h-full w-full rounded-2xl bg-white border-0"
                  >
                    {/* Fallback if browser blocks iframe */}
                    <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-white rounded-2xl space-y-3">
                      <FileText size={48} className="text-[#EF4444]" />
                      <h4 className="text-base font-bold text-[#111827]">
                        {activeViewerModal.material.title}
                      </h4>
                      <p className="text-xs text-[#6B7280] max-w-sm">
                        This PDF is ready to view. Click below to open the complete document in your browser or download it.
                      </p>
                      <div className="flex gap-2">
                        <a
                          href={activeViewerModal.material.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#10B981] px-4 py-2 text-xs font-bold text-white hover:bg-[#0E9F72]"
                        >
                          <ExternalLink size={13} /> Open PDF Guide
                        </a>
                      </div>
                    </div>
                  </iframe>
                </object>
              ) : (
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                    activeViewerModal.material.url.startsWith("http")
                      ? activeViewerModal.material.url
                      : `${typeof window !== "undefined" ? window.location.origin : ""}${activeViewerModal.material.url}`
                  )}&embedded=true`}
                  title={activeViewerModal.material.title}
                  className="h-full w-full rounded-2xl border-0 bg-white"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

