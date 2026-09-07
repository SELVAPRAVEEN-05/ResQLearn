"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  AlertCircle,
  Search,
  Sparkles,
  BookOpen,
  FileVideo,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Globe,
  Layers,
  Clock,
  Droplet,
  Flame,
  Wind,
  Activity,
  Sun,
  Shield,
  X,
  Play,
  RotateCw,
  File,
  Check,
  Image as ImageIcon,
  CheckCircle,
  Film,
} from "lucide-react";
import {
  getAdminCourses,
  getAdminCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  publishCourse,
  unpublishCourse,
  createLesson,
  updateLesson,
  deleteLesson,
  addMaterial,
  updateMaterial,
  deleteMaterial,
  generateAiCourseStructure,
  CourseItem,
  LessonItem,
  MaterialItem,
} from "@/lib/api/courses";
import { detectMaterialTypeFromUrl, getYouTubeEmbedUrl, isPdfUrl } from "@/lib/validations/course";

const VERIFIED_PRESET_MATERIALS = [
  {
    title: "NWS Flood Safety & Preparedness Portal",
    type: "WEBSITE" as const,
    url: "https://www.weather.gov/safety/flood",
    description: "National Weather Service comprehensive flood risk and safety portal",
  },
  {
    title: "Floods 101 - National Geographic (Video)",
    type: "VIDEO" as const,
    url: "https://www.youtube.com/watch?v=4PXj7bOD7IY",
    description: "Overview of flash flood mechanics, runoff velocity, and flood risks",
  },
  {
    title: "Ready.gov Earthquake Preparedness Guide",
    type: "WEBSITE" as const,
    url: "https://www.ready.gov/earthquakes",
    description: "Official federal emergency guidelines for seismic home safety and actions",
  },
  {
    title: "Earthquakes 101 - National Geographic (Video)",
    type: "VIDEO" as const,
    url: "https://www.youtube.com/watch?v=e7ho6z32yyo",
    description: "Tectonic fault line mechanics, seismic waves, and structural hazards",
  },
  {
    title: "Earthquake Safety & Actions (Video)",
    type: "VIDEO" as const,
    url: "https://www.youtube.com/watch?v=BLEPakj1YTY",
    description: "Drop, Cover, and Hold On emergency response demonstration",
  },
  {
    title: "NWS Hurricane & Severe Storm Portal",
    type: "WEBSITE" as const,
    url: "https://www.weather.gov/safety/hurricane",
    description: "National Weather Service coastal storm preparedness and evacuation guide",
  },
  {
    title: "Hurricanes 101 - National Geographic (Video)",
    type: "VIDEO" as const,
    url: "https://www.youtube.com/watch?v=zP4rgvu4xDE",
    description: "Tropical storm eye genesis, wind categories, and storm surge dynamics",
  },
  {
    title: "USFA Home Fire Safety & Prevention Guide",
    type: "WEBSITE" as const,
    url: "https://www.ready.gov/home-fires",
    description: "Official federal emergency guidelines on home fire prevention and safety plans",
  },
  {
    title: "Fire Extinguisher PASS Technique (Video)",
    type: "VIDEO" as const,
    url: "https://www.youtube.com/watch?v=PQV71INDaqY",
    description: "Instructional demonstration of the PASS technique on live flames",
  },
];

const DISASTER_CATEGORIES = [
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
] as const;

const MATERIAL_TYPES = [
  "PDF",
  "VIDEO",
  "WEBSITE",
  "ARTICLE",
  "IMAGE",
  "DOCUMENT",
  "EXTERNAL_RESOURCE",
] as const;

export default function AdminContentPage() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDisaster, setSelectedDisaster] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<"All" | "Published" | "Draft">("All");

  // Notifications / Feedback
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "course" | "lesson" | "material";
    id: number | string;
    title: string;
    extraId?: number | string;
  } | null>(null);

  // Active items for Builder / Edit / Preview
  const [activeCourse, setActiveCourse] = useState<CourseItem | null>(null);
  const [builderLoading, setBuilderLoading] = useState(false);

  // Lesson modal state inside builder
  const [lessonModal, setLessonModal] = useState<{
    isOpen: boolean;
    isEditing: boolean;
    lessonId?: number | string;
    title: string;
    description: string;
    content: string;
    type: string;
    order: number;
    videoUrl: string;
    resourceUrl: string;
    duration: string;
    published: boolean;
    saving: boolean;
  }>({
    isOpen: false,
    isEditing: false,
    title: "",
    description: "",
    content: "",
    type: "document",
    order: 0,
    videoUrl: "",
    resourceUrl: "",
    duration: "",
    published: true,
    saving: false,
  });

  // Material modal state inside builder
  const [materialModal, setMaterialModal] = useState<{
    isOpen: boolean;
    isEditing: boolean;
    lessonId: number | string;
    materialId?: number | string;
    title: string;
    description: string;
    type: "PDF" | "VIDEO" | "WEBSITE" | "ARTICLE" | "IMAGE" | "DOCUMENT" | "EXTERNAL_RESOURCE";
    url: string;
    saving: boolean;
  }>({
    isOpen: false,
    isEditing: false,
    lessonId: 0,
    title: "",
    description: "",
    type: "PDF",
    url: "",
    saving: false,
  });

  // Create/Edit Course form state
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    disasterType: "Flood",
    difficulty: "Beginner" as "Beginner" | "Intermediate" | "Advanced",
    estimatedDuration: "30 min",
    thumbnail: "",
    videoUrl: "",
    resourceUrl: "",
    published: false,
    saving: false,
  });

  // AI Assistant form state
  const [aiForm, setAiForm] = useState({
    disasterType: "Flood",
    topic: "",
    audience: "Students & General Public",
    loading: false,
    draftResult: null as any,
  });

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4500);
  };

  const loadCourses = async () => {
    setLoading(true);
    const res = await getAdminCourses();
    if (res.error) {
      showFeedback("error", res.error);
    } else {
      setCourses(res.courses);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const openBuilder = async (courseIdOrSlug: string | number) => {
    setBuilderLoading(true);
    setIsBuilderOpen(true);
    const res = await getAdminCourse(courseIdOrSlug);
    if (res.course) {
      setActiveCourse(res.course);
    } else {
      showFeedback("error", res.error || "Failed to load course details");
    }
    setBuilderLoading(false);
  };

  const refreshActiveCourse = async () => {
    if (!activeCourse) return;
    const res = await getAdminCourse(activeCourse.id);
    if (res.course) {
      setActiveCourse(res.course);
    }
    loadCourses();
  };

  const openPreview = async (courseIdOrSlug: string | number) => {
    setBuilderLoading(true);
    setIsPreviewOpen(true);
    const res = await getAdminCourse(courseIdOrSlug);
    if (res.course) {
      setActiveCourse(res.course);
    }
    setBuilderLoading(false);
  };

  const openEditCourse = (course: CourseItem) => {
    setActiveCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description,
      disasterType: course.disasterType || (course as any).category || "Flood",
      difficulty: course.difficulty || "Beginner",
      estimatedDuration: course.estimatedDuration || course.duration || "30 min",
      thumbnail: course.thumbnail || "",
      videoUrl: course.videoUrl || "",
      resourceUrl: course.resourceUrl || "",
      published: !!(course.published ?? course.isPublished),
      saving: false,
    });
    setIsEditCourseOpen(true);
  };

  // Filtered Courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase()) ||
        (c.disasterType && c.disasterType.toLowerCase().includes(search.toLowerCase()));

      const matchesDisaster =
        selectedDisaster === "All" ||
        (c.disasterType && c.disasterType.toLowerCase() === selectedDisaster.toLowerCase()) ||
        ((c as any).category && (c as any).category.toLowerCase() === selectedDisaster.toLowerCase());

      const isPub = !!(c.published ?? c.isPublished);
      const matchesStatus =
        selectedStatus === "All" ||
        (selectedStatus === "Published" && isPub) ||
        (selectedStatus === "Draft" && !isPub);

      return matchesSearch && matchesDisaster && matchesStatus;
    });
  }, [courses, search, selectedDisaster, selectedStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = courses.length;
    const published = courses.filter((c) => !!(c.published ?? c.isPublished)).length;
    const totalLessons = courses.reduce((acc, c) => acc + (c.lessonCount || c.lessons?.length || 0), 0);
    const totalMaterials = courses.reduce((acc, c) => acc + (c.materialCount || 0), 0);
    return { total, published, totalLessons, totalMaterials };
  }, [courses]);

  // Handlers for Course CRUD
  const handleCreateCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.title.trim()) {
      showFeedback("error", "Course title is required");
      return;
    }

    setCourseForm((prev) => ({ ...prev, saving: true }));
    const res = await createCourse({
      title: courseForm.title,
      description: courseForm.description,
      disasterType: courseForm.disasterType,
      difficulty: courseForm.difficulty,
      estimatedDuration: courseForm.estimatedDuration,
      thumbnail: courseForm.thumbnail,
      videoUrl: courseForm.videoUrl,
      resourceUrl: courseForm.resourceUrl,
      published: courseForm.published,
    });

    setCourseForm((prev) => ({ ...prev, saving: false }));

    if (res.error) {
      showFeedback("error", res.error);
    } else {
      showFeedback("success", `Course "${courseForm.title}" created successfully!`);
      setIsCreateOpen(false);
      setCourseForm({
        title: "",
        description: "",
        disasterType: "Flood",
        difficulty: "Beginner",
        estimatedDuration: "30 min",
        thumbnail: "",
        videoUrl: "",
        resourceUrl: "",
        published: false,
        saving: false,
      });
      loadCourses();
      if (res.course) {
        openBuilder(res.course.id);
      }
    }
  };

  const handleUpdateCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCourse) return;

    setCourseForm((prev) => ({ ...prev, saving: true }));
    const res = await updateCourse(activeCourse.id, {
      title: courseForm.title,
      description: courseForm.description,
      disasterType: courseForm.disasterType,
      difficulty: courseForm.difficulty,
      estimatedDuration: courseForm.estimatedDuration,
      thumbnail: courseForm.thumbnail,
      published: courseForm.published,
    });

    setCourseForm((prev) => ({ ...prev, saving: false }));

    if (res.error) {
      showFeedback("error", res.error);
    } else {
      showFeedback("success", "Course updated successfully!");
      setIsEditCourseOpen(false);
      loadCourses();
      if (isBuilderOpen) {
        refreshActiveCourse();
      }
    }
  };

  const handleTogglePublish = async (course: CourseItem) => {
    const isPub = !!(course.published ?? course.isPublished);
    const res = isPub ? await unpublishCourse(course.id) : await publishCourse(course.id);
    if (res.error) {
      showFeedback("error", res.error);
    } else {
      showFeedback("success", `Course ${isPub ? "unpublished" : "published"} successfully!`);
      loadCourses();
      if (activeCourse && activeCourse.id === course.id) {
        refreshActiveCourse();
      }
    }
  };

  // Open "Add Lesson" Modal
  const handleOpenAddLesson = () => {
    const nextOrder = (activeCourse?.lessons?.length || 0) + 1;
    setLessonModal({
      isOpen: true,
      isEditing: false,
      title: "",
      description: "",
      content: "",
      type: "document",
      order: nextOrder,
      videoUrl: "",
      resourceUrl: "",
      duration: "",
      published: true,
      saving: false,
    });
  };

  // Open "Edit Lesson" Modal
  const handleOpenEditLesson = (lesson: LessonItem, idx: number) => {
    const videoMat = lesson.materials?.find((m) => m.type === "VIDEO");
    const resourceMat = lesson.materials?.find((m) => m.type !== "VIDEO");

    setLessonModal({
      isOpen: true,
      isEditing: true,
      lessonId: lesson.id,
      title: lesson.title,
      description: lesson.description || "",
      content: lesson.content || "",
      type: lesson.type || "document",
      order: typeof lesson.order === "number" ? lesson.order + 1 : idx + 1,
      videoUrl: lesson.videoUrl || videoMat?.url || "",
      resourceUrl: lesson.resourceUrl || resourceMat?.url || "",
      duration: lesson.duration || "",
      published: lesson.published ?? lesson.isPublished ?? true,
      saving: false,
    });
  };

  // Save Lesson Handler (Add / Edit)
  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCourse) {
      showFeedback("error", "No active course selected");
      return;
    }

    if (!lessonModal.title.trim()) {
      showFeedback("error", "Lesson title is required");
      return;
    }

    setLessonModal((prev) => ({ ...prev, saving: true }));

    const lessonPayload = {
      title: lessonModal.title.trim(),
      description: lessonModal.description.trim(),
      content: lessonModal.content.trim() || lessonModal.description.trim() || "Instructional guidance and emergency protocols.",
      type: lessonModal.type || "document",
      order: lessonModal.order >= 1 ? lessonModal.order - 1 : 0,
      published: lessonModal.published,
      videoUrl: lessonModal.videoUrl.trim(),
      resourceUrl: lessonModal.resourceUrl.trim(),
      duration: lessonModal.duration.trim(),
    };

    if (lessonModal.isEditing && lessonModal.lessonId) {
      const res = await updateLesson(lessonModal.lessonId, lessonPayload);
      setLessonModal((prev) => ({ ...prev, saving: false }));
      if (res.error) {
        showFeedback("error", res.error);
      } else {
        showFeedback("success", "Lesson updated successfully.");
        setLessonModal((prev) => ({ ...prev, isOpen: false }));
        refreshActiveCourse();
      }
    } else {
      const res = await createLesson(activeCourse.id, lessonPayload);
      setLessonModal((prev) => ({ ...prev, saving: false }));
      if (res.error) {
        showFeedback("error", res.error);
      } else {
        showFeedback("success", "Lesson created successfully.");
        setLessonModal((prev) => ({ ...prev, isOpen: false }));
        refreshActiveCourse();
      }
    }
  };

  const handleReorderLesson = async (lessonIndex: number, direction: "up" | "down") => {
    if (!activeCourse || !activeCourse.lessons) return;
    const targetIndex = direction === "up" ? lessonIndex - 1 : lessonIndex + 1;
    if (targetIndex < 0 || targetIndex >= activeCourse.lessons.length) return;

    const currentLesson = activeCourse.lessons[lessonIndex];
    const targetLesson = activeCourse.lessons[targetIndex];

    await Promise.all([
      updateLesson(currentLesson.id, { order: targetIndex }),
      updateLesson(targetLesson.id, { order: lessonIndex }),
    ]);

    refreshActiveCourse();
  };

  // Material Handlers
  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialModal.title.trim() || !materialModal.url.trim()) {
      showFeedback("error", "Material title and valid URL are required");
      return;
    }

    setMaterialModal((prev) => ({ ...prev, saving: true }));

    if (materialModal.isEditing && materialModal.materialId) {
      const res = await updateMaterial(materialModal.materialId, {
        title: materialModal.title,
        description: materialModal.description,
        type: materialModal.type,
        url: materialModal.url,
      });
      setMaterialModal((prev) => ({ ...prev, saving: false }));
      if (res.error) {
        showFeedback("error", res.error);
      } else {
        showFeedback("success", "Material updated!");
        setMaterialModal((prev) => ({ ...prev, isOpen: false }));
        refreshActiveCourse();
      }
    } else {
      const res = await addMaterial(materialModal.lessonId, {
        title: materialModal.title,
        description: materialModal.description,
        type: materialModal.type,
        url: materialModal.url,
      });
      setMaterialModal((prev) => ({ ...prev, saving: false }));
      if (res.error) {
        showFeedback("error", res.error);
      } else {
        showFeedback("success", "Material added to lesson!");
        setMaterialModal((prev) => ({ ...prev, isOpen: false }));
        refreshActiveCourse();
      }
    }
  };

  // Material URL auto-detection change handler
  const handleMaterialUrlChange = (url: string) => {
    const detectedType = detectMaterialTypeFromUrl(url);
    setMaterialModal((prev) => ({
      ...prev,
      url,
      type: detectedType as any,
    }));
  };

  // AI Course Assistant
  const handleGenerateAiCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiForm.topic.trim()) {
      showFeedback("error", "Please specify a topic for the AI generator");
      return;
    }

    setAiForm((prev) => ({ ...prev, loading: true }));
    const res = await generateAiCourseStructure(aiForm.disasterType, aiForm.topic, aiForm.audience);
    if (res.error) {
      showFeedback("error", res.error);
      setAiForm((prev) => ({ ...prev, loading: false }));
    } else {
      setAiForm((prev) => ({
        ...prev,
        loading: false,
        draftResult: res.draft,
      }));
    }
  };

  const handleAcceptAiDraft = async () => {
    if (!aiForm.draftResult) return;
    const draft = aiForm.draftResult;

    // Create course first
    const courseRes = await createCourse({
      title: draft.title,
      description: draft.description,
      disasterType: draft.disasterType || aiForm.disasterType,
      difficulty: draft.difficulty || "Beginner",
      estimatedDuration: draft.estimatedDuration || "45 min",
      published: false,
    });

    if (courseRes.error || !courseRes.course) {
      showFeedback("error", courseRes.error || "Failed to create course from AI draft");
      return;
    }

    const createdCourse = courseRes.course;

    // Create lessons and their suggested materials
    if (Array.isArray(draft.lessons)) {
      for (let i = 0; i < draft.lessons.length; i++) {
        const l = draft.lessons[i];
        const lessonRes = await createLesson(createdCourse.id, {
          title: l.title,
          description: l.description || "",
          content: l.content || "Lesson content outline.",
          type: l.type || "document",
          order: i,
        });

        if (lessonRes.lesson && Array.isArray(l.suggestedMaterials)) {
          for (let mIdx = 0; mIdx < l.suggestedMaterials.length; mIdx++) {
            const m = l.suggestedMaterials[mIdx];
            await addMaterial(lessonRes.lesson.id, {
              title: m.title || "Reference Material",
              description: m.description || "",
              type: m.type || "PDF",
              url: m.url || "https://www.ready.gov",
              order: mIdx,
            });
          }
        }
      }
    }

    showFeedback("success", `AI Draft "${draft.title}" successfully created as Draft!`);
    setIsAiOpen(false);
    setAiForm({
      disasterType: "Flood",
      topic: "",
      audience: "Students & General Public",
      loading: false,
      draftResult: null,
    });
    loadCourses();
    openBuilder(createdCourse.id);
  };

  // Execution of Delete
  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;

    if (deleteConfirm.type === "course") {
      const res = await deleteCourse(deleteConfirm.id);
      if (res.error) {
        showFeedback("error", res.error);
      } else {
        showFeedback("success", "Course deleted successfully.");
        loadCourses();
        if (activeCourse && activeCourse.id === deleteConfirm.id) {
          setIsBuilderOpen(false);
          setIsPreviewOpen(false);
        }
      }
    } else if (deleteConfirm.type === "lesson") {
      const res = await deleteLesson(deleteConfirm.id);
      if (res.error) {
        showFeedback("error", res.error);
      } else {
        showFeedback("success", "Lesson deleted successfully.");
        refreshActiveCourse();
      }
    } else if (deleteConfirm.type === "material") {
      const res = await deleteMaterial(deleteConfirm.id);
      if (res.error) {
        showFeedback("error", res.error);
      } else {
        showFeedback("success", "Material removed.");
        refreshActiveCourse();
      }
    }

    setDeleteConfirm(null);
  };

  // Disaster Icon Helper
  const getDisasterBadge = (type: string) => {
    const t = type ? type.toLowerCase() : "";
    if (t.includes("flood")) {
      return { icon: Droplet, color: "bg-[#0284C7]/10 text-[#0284C7] border-[#0284C7]/20" };
    }
    if (t.includes("fire")) {
      return { icon: Flame, color: "bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20" };
    }
    if (t.includes("cyclone")) {
      return { icon: Wind, color: "bg-[#0D9488]/10 text-[#0D9488] border-[#0D9488]/20" };
    }
    if (t.includes("earthquake")) {
      return { icon: Activity, color: "bg-[#D97706]/10 text-[#D97706] border-[#D97706]/20" };
    }
    if (t.includes("heatwave")) {
      return { icon: Sun, color: "bg-[#EA580C]/10 text-[#EA580C] border-[#EA580C]/20" };
    }
    return { icon: Shield, color: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20" };
  };

  // Material Icon Helper
  const getMaterialIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case "VIDEO":
        return <FileVideo className="text-[#3B82F6]" size={16} />;
      case "PDF":
        return <FileText className="text-[#EF4444]" size={16} />;
      case "IMAGE":
        return <ImageIcon className="text-[#10B981]" size={16} />;
      case "WEBSITE":
      case "ARTICLE":
        return <Globe className="text-[#8B5CF6]" size={16} />;
      default:
        return <File className="text-[#6B7280]" size={16} />;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-[fadeIn_0.4s_ease-out]">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`fixed top-4 right-4 z-70 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-xl border animate-[slideDown_0.3s_ease-out] ${
            feedback.type === "success"
              ? "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]"
              : "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]"
          }`}
        >
          {feedback.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0F172A]">Educational Content</h1>
            <span className="rounded-full bg-[#10B981]/10 px-2.5 py-0.5 text-xs font-bold text-[#059669] border border-[#10B981]/20">
              Neon PostgreSQL
            </span>
          </div>
          <p className="mt-1 text-sm text-[#64748B]">
            Build, curate, and publish disaster preparedness courses, lessons, videos, and study guides.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAiOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-white px-4 py-2.5 text-xs font-bold text-[#334155] shadow-xs transition hover:border-[#10B981] hover:text-[#059669] hover:bg-[#F8FAFC]"
          >
            <Sparkles size={15} className="text-[#10B981]" /> AI Course Generator
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#10B981] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#059669] active:scale-98"
          >
            <Plus size={16} /> Create Course
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Courses</span>
            <BookOpen size={16} className="text-[#10B981]" />
          </div>
          <p className="mt-2 text-2xl font-black text-[#0F172A]">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[#059669]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Published</span>
            <CheckCircle2 size={16} className="text-[#10B981]" />
          </div>
          <p className="mt-2 text-2xl font-black text-[#059669]">{stats.published}</p>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Lessons</span>
            <Layers size={16} className="text-[#3B82F6]" />
          </div>
          <p className="mt-2 text-2xl font-black text-[#0F172A]">{stats.totalLessons}</p>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-bold uppercase tracking-wider">Materials</span>
            <Globe size={16} className="text-[#8B5CF6]" />
          </div>
          <p className="mt-2 text-2xl font-black text-[#0F172A]">{stats.totalMaterials}</p>
        </div>
      </div>

      {/* Search & Category Tabs */}
      <div className="space-y-3 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses by title, topic, or disaster category..."
              className="w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] py-2.5 pl-10 pr-4 text-sm font-medium text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#10B981] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10B981]/20"
            />
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto bg-[#F1F5F9] p-1 rounded-xl">
            {(["All", "Published", "Draft"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                  selectedStatus === st
                    ? "bg-white text-[#0F172A] shadow-2xs"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Disaster Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar">
          {DISASTER_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedDisaster(cat)}
              className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-bold transition ${
                selectedDisaster === cat
                  ? "bg-[#10B981] text-white shadow-2xs"
                  : "border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#CBD5E1] hover:text-[#0F172A]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Courses List Table / Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white py-20 text-center shadow-2xs">
          <RotateCw size={32} className="animate-spin text-[#10B981] mb-3" />
          <p className="text-sm font-bold text-[#0F172A]">Loading courses from Neon PostgreSQL...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#CBD5E1] bg-white py-20 text-center">
          <BookOpen size={40} className="text-[#94A3B8] mb-3" />
          <h3 className="text-base font-bold text-[#0F172A]">No courses found</h3>
          <p className="mt-1 text-xs text-[#64748B] max-w-sm">
            No educational modules match your current filter or search criteria.
          </p>
          <div className="mt-5 flex gap-2">
            <button
              onClick={() => {
                setSearch("");
                setSelectedDisaster("All");
                setSelectedStatus("All");
              }}
              className="rounded-xl border border-[#CBD5E1] bg-white px-4 py-2 text-xs font-bold text-[#334155] hover:bg-[#F8FAFC]"
            >
              Reset Filters
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="rounded-xl bg-[#10B981] px-4 py-2 text-xs font-bold text-white hover:bg-[#059669]"
            >
              <Plus size={14} className="inline mr-1" /> Create Course
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => {
            const badge = getDisasterBadge(course.disasterType || (course as any).category);
            const IconComp = badge.icon;
            const isPub = !!(course.published ?? course.isPublished);

            return (
              <div
                key={course.id}
                className="group flex flex-col justify-between rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-2xs transition hover:border-[#10B981]/60 hover:shadow-md"
              >
                <div className="space-y-3">
                  {/* Card Header: Category & Status */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${badge.color}`}
                    >
                      <IconComp size={13} />
                      {course.disasterType || (course as any).category}
                    </span>

                    <button
                      onClick={() => handleTogglePublish(course)}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition ${
                        isPub
                          ? "bg-[#DCFCE7] text-[#15803D] hover:bg-[#BBF7D0]"
                          : "bg-[#FEF3C7] text-[#B45309] hover:bg-[#FDE68A]"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${isPub ? "bg-[#16A34A]" : "bg-[#D97706]"}`} />
                      {isPub ? "Published" : "Draft"}
                    </button>
                  </div>

                  {/* Course Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-[#0F172A] line-clamp-1 group-hover:text-[#059669] transition">
                      {course.title}
                    </h3>
                    <p className="mt-1 text-xs text-[#64748B] line-clamp-2 leading-relaxed">{course.description}</p>
                  </div>

                  {/* Badges / Metrics */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-bold text-[#64748B]">
                    <span className="flex items-center gap-1 rounded-lg bg-[#F1F5F9] px-2.5 py-1">
                      <Clock size={12} className="text-[#64748B]" /> {course.estimatedDuration || course.duration || "30 min"}
                    </span>
                    <span className="flex items-center gap-1 rounded-lg bg-[#F1F5F9] px-2.5 py-1">
                      <Layers size={12} className="text-[#64748B]" /> {course.lessonCount || course.lessons?.length || 0} Lessons
                    </span>
                    <span className="rounded-lg bg-[#F1F5F9] px-2.5 py-1">{course.difficulty || "Beginner"}</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 flex items-center justify-between border-t border-[#F1F5F9] pt-3.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openBuilder(course.id)}
                      className="flex items-center gap-1 rounded-xl bg-[#10B981]/10 px-3.5 py-2 text-xs font-bold text-[#059669] hover:bg-[#10B981] hover:text-white transition"
                    >
                      <Layers size={13} /> Manage Lessons
                    </button>
                    <button
                      onClick={() => openPreview(course.id)}
                      className="rounded-xl border border-[#CBD5E1] bg-white p-2 text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition"
                      title="Preview Course"
                    >
                      <Eye size={14} />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditCourse(course)}
                      className="rounded-xl border border-[#CBD5E1] bg-white p-2 text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition"
                      title="Edit Course Details"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteConfirm({
                          type: "course",
                          id: course.id,
                          title: course.title,
                        })
                      }
                      className="rounded-xl border border-[#FEE2E2] bg-[#FEF2F2] p-2 text-[#DC2626] hover:bg-[#FEE2E2] transition"
                      title="Delete Course"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODAL 1: CREATE COURSE ================= */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
          <div className="flex flex-col w-full max-w-xl max-h-[90vh] rounded-3xl bg-white shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-white px-6 py-4 shrink-0">
              <div>
                <h2 className="text-base sm:text-lg font-black text-[#0F172A]">Create Educational Course</h2>
                <p className="text-xs text-[#64748B]">Add a disaster preparedness training module to Neon PostgreSQL</p>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="rounded-full p-2 text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form id="create-course-form" onSubmit={handleCreateCourseSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-[#334155]">Course Title <span className="text-[#DC2626]">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flood Safety and Preparedness"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-3 text-sm font-medium text-[#0F172A] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#334155]">Disaster Category <span className="text-[#DC2626]">*</span></label>
                  <select
                    value={courseForm.disasterType}
                    onChange={(e) => setCourseForm({ ...courseForm, disasterType: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-3 text-sm font-medium text-[#0F172A] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 focus:outline-none"
                  >
                    {DISASTER_CATEGORIES.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#334155]">Difficulty Level</label>
                  <select
                    value={courseForm.difficulty}
                    onChange={(e) => setCourseForm({ ...courseForm, difficulty: e.target.value as any })}
                    className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-3 text-sm font-medium text-[#0F172A] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 focus:outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#334155]">Estimated Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 45 min"
                    value={courseForm.estimatedDuration}
                    onChange={(e) => setCourseForm({ ...courseForm, estimatedDuration: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-3 text-sm font-medium text-[#0F172A] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#334155]">Course Thumbnail URL</label>
                  <input
                    type="text"
                    placeholder="https://... or /images/..."
                    value={courseForm.thumbnail}
                    onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-3 text-sm font-medium text-[#0F172A] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#334155]">Video Link (Optional Default Video)</label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={courseForm.videoUrl}
                  onChange={(e) => setCourseForm({ ...courseForm, videoUrl: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-3 text-sm font-mono text-xs text-[#0F172A] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#334155]">Resource Link (Optional Default Guide/PDF)</label>
                <input
                  type="text"
                  placeholder="https://www.ready.gov/flood or https://example.com/guide.pdf"
                  value={courseForm.resourceUrl}
                  onChange={(e) => setCourseForm({ ...courseForm, resourceUrl: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-3 text-sm font-mono text-xs text-[#0F172A] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#334155]">Course Description <span className="text-[#DC2626]">*</span></label>
                <textarea
                  required
                  rows={3}
                  placeholder="Learn how to prepare for, respond to, and recover from floods..."
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-3 text-sm font-medium text-[#0F172A] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 focus:outline-none resize-y"
                />
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-[#F8FAFC] p-3 border border-[#E2E8F0]">
                <input
                  type="checkbox"
                  id="create-publish"
                  checked={courseForm.published}
                  onChange={(e) => setCourseForm({ ...courseForm, published: e.target.checked })}
                  className="h-4 w-4 rounded text-[#10B981] focus:ring-[#10B981]"
                />
                <label htmlFor="create-publish" className="text-xs font-bold text-[#334155] cursor-pointer">
                  Publish immediately to students (otherwise saved as Draft)
                </label>
              </div>
            </form>

            {/* STICKY ALWAYS-VISIBLE FOOTER */}
            <div className="flex items-center justify-end gap-3 border-t border-[#E2E8F0] bg-[#F8FAFC] px-6 py-4 shrink-0">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-xl border border-[#CBD5E1] bg-white px-4 py-2.5 text-xs font-bold text-[#334155] hover:bg-[#F1F5F9] transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="create-course-form"
                disabled={courseForm.saving}
                className="rounded-xl bg-[#10B981] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#059669] shadow-sm disabled:opacity-50 flex items-center gap-1.5 transition active:scale-98"
              >
                {courseForm.saving ? (
                  <>
                    <RotateCw size={14} className="animate-spin" /> Creating Course...
                  </>
                ) : (
                  "Create Course"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: EDIT COURSE ================= */}
      {isEditCourseOpen && activeCourse && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
          <div className="flex flex-col w-full max-w-xl max-h-[90vh] rounded-3xl bg-white shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-white px-6 py-4 shrink-0">
              <div>
                <h2 className="text-base sm:text-lg font-black text-[#0F172A]">Edit Course Details</h2>
                <p className="text-xs text-[#64748B]">Update metadata, difficulty, duration, and status</p>
              </div>
              <button
                onClick={() => setIsEditCourseOpen(false)}
                className="rounded-full p-2 text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form id="edit-course-form" onSubmit={handleUpdateCourseSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-[#334155]">Course Title <span className="text-[#DC2626]">*</span></label>
                <input
                  type="text"
                  required
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-3 text-sm font-medium text-[#0F172A] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#334155]">Disaster Category</label>
                  <select
                    value={courseForm.disasterType}
                    onChange={(e) => setCourseForm({ ...courseForm, disasterType: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-3 text-sm font-medium text-[#0F172A] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 focus:outline-none"
                  >
                    {DISASTER_CATEGORIES.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#334155]">Difficulty Level</label>
                  <select
                    value={courseForm.difficulty}
                    onChange={(e) => setCourseForm({ ...courseForm, difficulty: e.target.value as any })}
                    className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-3 text-sm font-medium text-[#0F172A] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 focus:outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#334155]">Estimated Duration</label>
                  <input
                    type="text"
                    value={courseForm.estimatedDuration}
                    onChange={(e) => setCourseForm({ ...courseForm, estimatedDuration: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-3 text-sm font-medium text-[#0F172A] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#334155]">Course Thumbnail URL</label>
                  <input
                    type="text"
                    value={courseForm.thumbnail}
                    onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-3 text-sm font-medium text-[#0F172A] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#334155]">Course Description <span className="text-[#DC2626]">*</span></label>
                <textarea
                  rows={3}
                  required
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-3 text-sm font-medium text-[#0F172A] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 focus:outline-none resize-y"
                />
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-[#F8FAFC] p-3 border border-[#E2E8F0]">
                <input
                  type="checkbox"
                  id="edit-publish"
                  checked={courseForm.published}
                  onChange={(e) => setCourseForm({ ...courseForm, published: e.target.checked })}
                  className="h-4 w-4 rounded text-[#10B981] focus:ring-[#10B981]"
                />
                <label htmlFor="edit-publish" className="text-xs font-bold text-[#334155] cursor-pointer">
                  Course is Published and accessible to students
                </label>
              </div>
            </form>

            {/* STICKY ALWAYS-VISIBLE FOOTER */}
            <div className="flex items-center justify-end gap-3 border-t border-[#E2E8F0] bg-[#F8FAFC] px-6 py-4 shrink-0">
              <button
                type="button"
                onClick={() => setIsEditCourseOpen(false)}
                className="rounded-xl border border-[#CBD5E1] bg-white px-4 py-2.5 text-xs font-bold text-[#334155] hover:bg-[#F1F5F9] transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-course-form"
                disabled={courseForm.saving}
                className="rounded-xl bg-[#10B981] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#059669] shadow-sm disabled:opacity-50 flex items-center gap-1.5 transition active:scale-98"
              >
                {courseForm.saving ? (
                  <>
                    <RotateCw size={14} className="animate-spin" /> Saving Changes...
                  </>
                ) : (
                  "Save Course"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: AI ASSISTANT COURSE GENERATOR ================= */}
      {isAiOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
          <div className="flex flex-col w-full max-w-2xl max-h-[90vh] rounded-3xl bg-white shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-white px-6 py-4 shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#10B981]/15 text-[#059669]">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-[#0F172A]">AI Course Generator</h2>
                  <p className="text-xs text-[#64748B]">Auto-generate disaster curriculums, lessons, and verified materials</p>
                </div>
              </div>
              <button
                onClick={() => setIsAiOpen(false)}
                className="rounded-full p-2 text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {!aiForm.draftResult ? (
                <form id="ai-generate-form" onSubmit={handleGenerateAiCourse} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-[#334155]">Disaster Category</label>
                      <select
                        value={aiForm.disasterType}
                        onChange={(e) => setAiForm({ ...aiForm, disasterType: e.target.value })}
                        className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-3 text-sm font-medium text-[#0F172A] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 focus:outline-none"
                      >
                        {DISASTER_CATEGORIES.filter((c) => c !== "All").map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#334155]">Target Audience</label>
                      <input
                        type="text"
                        value={aiForm.audience}
                        onChange={(e) => setAiForm({ ...aiForm, audience: e.target.value })}
                        className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-3 text-sm font-medium text-[#0F172A] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#334155]">Topic / Focus Area <span className="text-[#DC2626]">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Flash Flood Survival & Evacuation Protocols"
                      value={aiForm.topic}
                      onChange={(e) => setAiForm({ ...aiForm, topic: e.target.value })}
                      className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-3 text-sm font-medium text-[#0F172A] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 focus:outline-none"
                    />
                  </div>

                  <div className="rounded-2xl bg-[#ECFDF5] p-4 text-xs leading-relaxed text-[#065F46] border border-[#A7F3D0]">
                    <p className="font-bold mb-1">Safety & Compliance Notice:</p>
                    AI-generated curriculum is created as a <strong>Draft</strong>. You will be able to review, edit
                    educational text, verify material URLs, and approve each lesson before publishing to students.
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-[#10B981]/15 px-3 py-0.5 text-xs font-bold text-[#059669]">
                        {aiForm.draftResult.disasterType}
                      </span>
                      <span className="text-xs font-bold text-[#64748B]">⏱ {aiForm.draftResult.estimatedDuration}</span>
                    </div>
                    <h3 className="text-base font-bold text-[#0F172A]">{aiForm.draftResult.title}</h3>
                    <p className="text-xs text-[#64748B]">{aiForm.draftResult.description}</p>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                      Generated Lessons ({aiForm.draftResult.lessons?.length || 0})
                    </p>
                    {aiForm.draftResult.lessons?.map((les: any, idx: number) => (
                      <div key={idx} className="rounded-xl border border-[#E2E8F0] bg-white p-3 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#F1F5F9] text-[10px] font-bold text-[#334155]">
                            {idx + 1}
                          </span>
                          <p className="text-xs font-bold text-[#0F172A]">{les.title}</p>
                        </div>
                        <p className="text-[11px] text-[#64748B] line-clamp-2">{les.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* STICKY ALWAYS-VISIBLE FOOTER */}
            <div className="flex items-center justify-between border-t border-[#E2E8F0] bg-[#F8FAFC] px-6 py-4 shrink-0">
              <button
                type="button"
                onClick={() => setIsAiOpen(false)}
                className="rounded-xl border border-[#CBD5E1] bg-white px-4 py-2.5 text-xs font-bold text-[#334155] hover:bg-[#F1F5F9] transition"
              >
                Cancel
              </button>

              {!aiForm.draftResult ? (
                <button
                  type="submit"
                  form="ai-generate-form"
                  disabled={aiForm.loading}
                  className="flex items-center gap-1.5 rounded-xl bg-[#10B981] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#059669] shadow-sm disabled:opacity-50 transition active:scale-98"
                >
                  {aiForm.loading ? (
                    <>
                      <RotateCw size={14} className="animate-spin" /> Generating Draft...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} /> Generate Course Draft
                    </>
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAiForm((prev) => ({ ...prev, draftResult: null }))}
                    className="text-xs font-bold text-[#64748B] hover:underline px-3 py-2"
                  >
                    Adjust Prompt
                  </button>
                  <button
                    onClick={handleAcceptAiDraft}
                    className="flex items-center gap-1.5 rounded-xl bg-[#10B981] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#059669] shadow-sm transition active:scale-98"
                  >
                    <Check size={16} /> Accept Draft & Open Builder
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: COURSE CONTENT BUILDER & LESSON MANAGER ================= */}
      {isBuilderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
          <div className="flex h-full max-h-[92vh] w-full max-w-4xl flex-col rounded-3xl bg-white shadow-2xl overflow-hidden">
            {/* Builder Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-[#F8FAFC] px-6 py-4 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#10B981]/15 px-2.5 py-0.5 text-xs font-bold text-[#059669]">
                    {activeCourse?.disasterType || (activeCourse as any)?.category}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      activeCourse?.published || activeCourse?.isPublished
                        ? "bg-[#DCFCE7] text-[#15803D]"
                        : "bg-[#FEF3C7] text-[#B45309]"
                    }`}
                  >
                    {activeCourse?.published || activeCourse?.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-[#0F172A]">{activeCourse?.title}</h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (activeCourse) openPreview(activeCourse.id);
                  }}
                  className="flex items-center gap-1 rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-2 text-xs font-bold text-[#334155] hover:bg-[#F1F5F9] transition"
                >
                  <Eye size={14} /> Preview
                </button>
                <button
                  onClick={() => setIsBuilderOpen(false)}
                  className="rounded-full p-2 text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Builder Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {builderLoading ? (
                <div className="py-20 text-center text-sm font-semibold text-[#64748B]">
                  <RotateCw size={28} className="animate-spin mx-auto mb-2 text-[#10B981]" />
                  Loading curriculum modules...
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-[#0F172A]">Course Modules & Lessons</h3>
                      <p className="text-xs text-[#64748B]">
                        Organize lessons and attach educational materials (Videos, PDFs, Resource Guides)
                      </p>
                    </div>
                    <button
                      onClick={handleOpenAddLesson}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-[#10B981] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#059669] transition active:scale-98"
                    >
                      <Plus size={15} /> Add Lesson
                    </button>
                  </div>

                  {/* Lessons List */}
                  {(!activeCourse?.lessons || activeCourse.lessons.length === 0) ? (
                    <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-10 text-center">
                      <BookOpen size={32} className="mx-auto text-[#94A3B8] mb-2" />
                      <p className="text-sm font-bold text-[#0F172A]">No lessons added yet</p>
                      <p className="text-xs text-[#64748B] mt-1">
                        Click &quot;Add Lesson&quot; above to create the first instructional unit.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeCourse.lessons.map((lesson, idx) => {
                        const videoMat = lesson.materials?.find((m) => m.type === "VIDEO");
                        const resourceMat = lesson.materials?.find((m) => m.type !== "VIDEO");
                        const hasVideo = !!(lesson.videoUrl || videoMat);
                        const hasResource = !!(lesson.resourceUrl || resourceMat);

                        return (
                          <div
                            key={lesson.id}
                            className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-2xs space-y-3 transition hover:border-[#CBD5E1]"
                          >
                            {/* Lesson Card Header */}
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-start gap-3">
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#0F172A] text-white text-xs font-black">
                                  {idx + 1}
                                </span>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-bold text-[#0F172A]">{lesson.title}</h4>
                                    <span
                                      className={`rounded-full px-2 py-0.2 text-[9px] font-bold ${
                                        lesson.published ?? lesson.isPublished ?? true
                                          ? "bg-[#DCFCE7] text-[#15803D]"
                                          : "bg-[#FEF3C7] text-[#B45309]"
                                      }`}
                                    >
                                      {lesson.published ?? lesson.isPublished ?? true ? "Published" : "Draft"}
                                    </span>
                                  </div>
                                  {lesson.description && (
                                    <p className="text-xs text-[#64748B] mt-0.5">{lesson.description}</p>
                                  )}
                                </div>
                              </div>

                              {/* Lesson Reorder & Action controls */}
                              <div className="flex items-center gap-1 self-end sm:self-auto">
                                <button
                                  disabled={idx === 0}
                                  onClick={() => handleReorderLesson(idx, "up")}
                                  className="rounded-lg p-2 text-[#64748B] hover:bg-[#F1F5F9] disabled:opacity-30 transition"
                                  title="Move Lesson Up"
                                >
                                  <ArrowUp size={15} />
                                </button>
                                <button
                                  disabled={idx === activeCourse.lessons!.length - 1}
                                  onClick={() => handleReorderLesson(idx, "down")}
                                  className="rounded-lg p-2 text-[#64748B] hover:bg-[#F1F5F9] disabled:opacity-30 transition"
                                  title="Move Lesson Down"
                                >
                                  <ArrowDown size={15} />
                                </button>
                                <button
                                  onClick={() => handleOpenEditLesson(lesson, idx)}
                                  className="rounded-lg p-2 text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition"
                                  title="Edit Lesson"
                                >
                                  <Edit size={15} />
                                </button>
                                <button
                                  onClick={() =>
                                    setDeleteConfirm({
                                      type: "lesson",
                                      id: lesson.id,
                                      title: lesson.title,
                                    })
                                  }
                                  className="rounded-lg p-2 text-[#DC2626] hover:bg-[#FEF2F2] transition"
                                  title="Delete Lesson"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </div>

                            {/* Lesson Quick Status Badges for Video & Resource */}
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              {hasVideo ? (
                                <span className="flex items-center gap-1 rounded-lg bg-[#EFF6FF] px-2.5 py-1 text-xs font-bold text-[#2563EB] border border-[#BFDBFE]">
                                  <FileVideo size={13} /> Video ✓
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 rounded-lg bg-[#F1F5F9] px-2.5 py-0.5 text-[10px] font-bold text-[#94A3B8]">
                                  No Video
                                </span>
                              )}

                              {hasResource ? (
                                <span className="flex items-center gap-1 rounded-lg bg-[#FEF2F2] px-2.5 py-1 text-xs font-bold text-[#DC2626] border border-[#FECACA]">
                                  <FileText size={13} /> Resource ✓
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 rounded-lg bg-[#F1F5F9] px-2.5 py-0.5 text-[10px] font-bold text-[#94A3B8]">
                                  No Resource
                                </span>
                              )}
                            </div>

                            {/* Lesson Summary Content */}
                            {lesson.content && (
                              <div className="rounded-xl bg-[#F8FAFC] p-3 text-xs text-[#334155] leading-relaxed line-clamp-2 border border-[#F1F5F9]">
                                {lesson.content}
                              </div>
                            )}

                            {/* Materials Container */}
                            <div className="rounded-xl border border-[#E2E8F0] bg-[#FAFAFA] p-3.5 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                                  Attached Educational Materials ({lesson.materials?.length || 0})
                                </span>
                                <button
                                  onClick={() =>
                                    setMaterialModal({
                                      isOpen: true,
                                      isEditing: false,
                                      lessonId: lesson.id,
                                      title: "",
                                      description: "",
                                      type: "PDF",
                                      url: "",
                                      saving: false,
                                    })
                                  }
                                  className="flex items-center gap-1 text-xs font-bold text-[#059669] hover:underline"
                                >
                                  <Plus size={13} /> Add Extra Material
                                </button>
                              </div>

                              {(!lesson.materials || lesson.materials.length === 0) ? (
                                <p className="text-xs text-[#94A3B8] py-1 italic">
                                  No materials attached. Edit lesson to add a YouTube video or reference link.
                                </p>
                              ) : (
                                <div className="grid gap-2 sm:grid-cols-2">
                                  {lesson.materials.map((mat) => (
                                    <div
                                      key={mat.id}
                                      className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-white p-2.5 shadow-2xs"
                                    >
                                      <div className="flex items-center gap-2 overflow-hidden pr-2">
                                        <span className="shrink-0">{getMaterialIcon(mat.type)}</span>
                                        <div className="overflow-hidden">
                                          <p className="text-xs font-bold text-[#0F172A] truncate">{mat.title}</p>
                                          <span className="rounded-sm bg-[#F1F5F9] px-1.5 py-0.2 text-[9px] font-bold text-[#64748B]">
                                            {mat.type}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-1 shrink-0">
                                        <a
                                          href={mat.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="rounded p-1 text-[#3B82F6] hover:bg-[#EFF6FF]"
                                          title="Open External Resource"
                                        >
                                          <ExternalLink size={13} />
                                        </a>
                                        <button
                                          onClick={() =>
                                            setMaterialModal({
                                              isOpen: true,
                                              isEditing: true,
                                              lessonId: lesson.id,
                                              materialId: mat.id,
                                              title: mat.title,
                                              description: mat.description || "",
                                              type: mat.type,
                                              url: mat.url,
                                              saving: false,
                                            })
                                          }
                                          className="rounded p-1 text-[#64748B] hover:bg-[#F1F5F9]"
                                          title="Edit Material"
                                        >
                                          <Edit size={13} />
                                        </button>
                                        <button
                                          onClick={() =>
                                            setDeleteConfirm({
                                              type: "material",
                                              id: mat.id,
                                              title: mat.title,
                                            })
                                          }
                                          className="rounded p-1 text-[#DC2626] hover:bg-[#FEF2F2]"
                                          title="Delete Material"
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Builder Footer */}
            <div className="flex items-center justify-between border-t border-[#E2E8F0] bg-[#F8FAFC] px-6 py-4 shrink-0">
              <button
                onClick={() => setIsBuilderOpen(false)}
                className="rounded-xl border border-[#CBD5E1] bg-white px-4 py-2.5 text-xs font-bold text-[#334155] hover:bg-[#F1F5F9] transition"
              >
                Close Builder
              </button>

              {activeCourse && (
                <button
                  onClick={() => handleTogglePublish(activeCourse)}
                  className={`flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-98 ${
                    activeCourse.published || activeCourse.isPublished
                      ? "bg-[#DC2626] hover:bg-[#B91C1C]"
                      : "bg-[#10B981] hover:bg-[#059669]"
                  }`}
                >
                  {activeCourse.published || activeCourse.isPublished ? (
                    "Unpublish Course"
                  ) : (
                    <>
                      <CheckCircle2 size={16} /> Publish Course
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 5: LESSON EDIT/CREATE ("Add Lesson") ================= */}
      {lessonModal.isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
          <div className="flex flex-col w-full max-w-xl max-h-[90vh] rounded-3xl bg-white shadow-2xl overflow-hidden">
            {/* FIXED MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-white px-6 py-4 shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#0F172A]">
                  {lessonModal.isEditing ? "Edit Lesson" : "Add Lesson"}
                </h3>
                <p className="text-xs text-[#64748B]">
                  {lessonModal.isEditing
                    ? "Update lesson instructional details and verified educational resources"
                    : "Add an instructional unit with video, guide, and emergency steps to Neon PostgreSQL"}
                </p>
              </div>
              <button
                onClick={() => setLessonModal((prev) => ({ ...prev, isOpen: false }))}
                className="rounded-full p-2 text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* SCROLLABLE FORM BODY */}
            <form id="lesson-form" onSubmit={handleSaveLesson} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-[#334155]">Lesson Title <span className="text-[#DC2626]">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lesson 1: Introduction to Floods"
                  value={lessonModal.title}
                  onChange={(e) => setLessonModal({ ...lessonModal, title: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-3 text-sm font-medium text-[#0F172A] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#334155]">Lesson Description / Summary</label>
                <input
                  type="text"
                  placeholder="e.g. Understand what floods are and why they occur."
                  value={lessonModal.description}
                  onChange={(e) => setLessonModal({ ...lessonModal, description: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-3 text-sm font-medium text-[#0F172A] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#334155]">Lesson Order Number</label>
                  <input
                    type="number"
                    min="1"
                    value={lessonModal.order}
                    onChange={(e) => setLessonModal({ ...lessonModal, order: parseInt(e.target.value, 10) || 1 })}
                    className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-3 text-sm font-medium text-[#0F172A] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#334155]">Duration (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 15 min"
                    value={lessonModal.duration}
                    onChange={(e) => setLessonModal({ ...lessonModal, duration: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-3 text-sm font-medium text-[#0F172A] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 focus:outline-none"
                  />
                </div>
              </div>

              {/* Video Link */}
              <div>
                <label className="text-xs font-bold text-[#334155] flex items-center gap-1.5">
                  <Film size={14} className="text-[#2563EB]" /> Video Link (YouTube / Vimeo / MP4)
                </label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=4PXj7bOD7IY"
                  value={lessonModal.videoUrl}
                  onChange={(e) => setLessonModal({ ...lessonModal, videoUrl: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-3 text-sm font-mono text-xs text-[#0F172A] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 focus:outline-none"
                />
                {lessonModal.videoUrl && (
                  <p className="mt-1 text-[11px] font-bold text-[#2563EB] flex items-center gap-1">
                    <CheckCircle size={12} /> Video link configured.
                  </p>
                )}
              </div>

              {/* Resource Link */}
              <div>
                <label className="text-xs font-bold text-[#334155] flex items-center gap-1.5">
                  <FileText size={14} className="text-[#DC2626]" /> Resource Link (PDF / Website / Article)
                </label>
                <input
                  type="text"
                  placeholder="https://www.weather.gov/safety/flood or https://example.com/guide.pdf"
                  value={lessonModal.resourceUrl}
                  onChange={(e) => setLessonModal({ ...lessonModal, resourceUrl: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-3 text-sm font-mono text-xs text-[#0F172A] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 focus:outline-none"
                />
                {lessonModal.resourceUrl && (
                  <p className="mt-1 text-[11px] font-bold text-[#059669] flex items-center gap-1">
                    <CheckCircle size={12} /> Resource link configured ({detectMaterialTypeFromUrl(lessonModal.resourceUrl)}).
                  </p>
                )}
              </div>

              {/* Educational Content Textarea with max-height and internal scrolling */}
              <div>
                <label className="text-xs font-bold text-[#334155]">Lesson Educational Content</label>
                <textarea
                  rows={4}
                  placeholder="Detailed instructional guidance, emergency protocols, and step-by-step survival guidelines..."
                  value={lessonModal.content}
                  onChange={(e) => setLessonModal({ ...lessonModal, content: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-3 text-sm font-medium text-[#0F172A] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 focus:outline-none resize-y max-h-48 overflow-y-auto"
                />
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-[#F8FAFC] p-3 border border-[#E2E8F0]">
                <input
                  type="checkbox"
                  id="lesson-publish"
                  checked={lessonModal.published}
                  onChange={(e) => setLessonModal({ ...lessonModal, published: e.target.checked })}
                  className="h-4 w-4 rounded text-[#10B981] focus:ring-[#10B981]"
                />
                <label htmlFor="lesson-publish" className="text-xs font-bold text-[#334155] cursor-pointer">
                  Lesson is Published and visible to students
                </label>
              </div>
            </form>

            {/* STICKY ALWAYS-VISIBLE FOOTER CONTAINING CANCEL | SAVE LESSON */}
            <div className="flex items-center justify-end gap-3 border-t border-[#E2E8F0] bg-[#F8FAFC] px-6 py-4 shrink-0">
              <button
                type="button"
                onClick={() => setLessonModal((prev) => ({ ...prev, isOpen: false }))}
                className="rounded-xl border border-[#CBD5E1] bg-white px-4 py-2.5 text-xs font-bold text-[#334155] hover:bg-[#F1F5F9] transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="lesson-form"
                disabled={lessonModal.saving}
                className="rounded-xl bg-[#10B981] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#059669] shadow-sm disabled:opacity-50 flex items-center gap-1.5 transition active:scale-98"
              >
                {lessonModal.saving ? (
                  <>
                    <RotateCw size={14} className="animate-spin" /> Saving Lesson...
                  </>
                ) : (
                  "Save Lesson"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 6: MATERIAL EDIT/CREATE ================= */}
      {materialModal.isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
          <div className="flex flex-col w-full max-w-lg max-h-[90vh] rounded-3xl bg-white shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-white px-6 py-4 shrink-0">
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">
                  {materialModal.isEditing ? "Edit Educational Material" : "Add Educational Material"}
                </h3>
                <p className="text-xs text-[#64748B]">Attach reference materials, guides, or video streams</p>
              </div>
              <button
                onClick={() => setMaterialModal((prev) => ({ ...prev, isOpen: false }))}
                className="rounded-full p-2 text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Body */}
            <form id="material-form" onSubmit={handleSaveMaterial} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {/* Quick Presets Picker */}
              <div className="rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#166534]">
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#10B981]" /> Quick Verified Resource Presets
                  </span>
                  <span className="text-[10px] text-[#15803D] font-normal">1-Click Auto-Fill</span>
                </div>
                <select
                  defaultValue=""
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    if (!isNaN(idx) && VERIFIED_PRESET_MATERIALS[idx]) {
                      const preset = VERIFIED_PRESET_MATERIALS[idx];
                      setMaterialModal((prev) => ({
                        ...prev,
                        title: preset.title,
                        type: preset.type,
                        url: preset.url,
                        description: preset.description,
                      }));
                    }
                  }}
                  className="w-full rounded-xl border border-[#86EFAC] bg-white p-2 text-xs font-semibold text-[#166534] focus:outline-none"
                >
                  <option value="" disabled>
                    -- Select a Verified Disaster Guide or Video --
                  </option>
                  {VERIFIED_PRESET_MATERIALS.map((p, pIdx) => (
                    <option key={pIdx} value={pIdx}>
                      [{p.type}] {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#334155]">Material Resource URL or File Path <span className="text-[#DC2626]">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="https://www.youtube.com/watch?v=... or /docs/guide.pdf"
                  value={materialModal.url}
                  onChange={(e) => handleMaterialUrlChange(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-3 text-sm font-mono text-xs text-[#0F172A] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#334155]">Material Title <span className="text-[#DC2626]">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Official Flood Preparedness Guide"
                  value={materialModal.title}
                  onChange={(e) => setMaterialModal({ ...materialModal, title: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-3 text-sm font-medium text-[#0F172A] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#334155]">Material Type</label>
                <select
                  value={materialModal.type}
                  onChange={(e) => setMaterialModal({ ...materialModal, type: e.target.value as any })}
                  className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-3 text-sm font-medium text-[#0F172A] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 focus:outline-none"
                >
                  {MATERIAL_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#334155]">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="Short note on what students learn from this resource"
                  value={materialModal.description}
                  onChange={(e) => setMaterialModal({ ...materialModal, description: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-3 text-sm font-medium text-[#0F172A] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 focus:outline-none"
                />
              </div>
            </form>

            {/* STICKY ALWAYS-VISIBLE FOOTER */}
            <div className="flex items-center justify-end gap-3 border-t border-[#E2E8F0] bg-[#F8FAFC] px-6 py-4 shrink-0">
              <button
                type="button"
                onClick={() => setMaterialModal((prev) => ({ ...prev, isOpen: false }))}
                className="rounded-xl border border-[#CBD5E1] bg-white px-4 py-2.5 text-xs font-bold text-[#334155] hover:bg-[#F1F5F9] transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="material-form"
                disabled={materialModal.saving}
                className="rounded-xl bg-[#10B981] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#059669] disabled:opacity-50 flex items-center gap-1.5 transition active:scale-98"
              >
                {materialModal.saving ? (
                  <>
                    <RotateCw size={14} className="animate-spin" /> Saving Material...
                  </>
                ) : (
                  "Save Material"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 7: LIVE COURSE PREVIEW ================= */}
      {isPreviewOpen && activeCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
          <div className="flex h-full max-h-[92vh] w-full max-w-2xl flex-col rounded-3xl bg-white shadow-2xl overflow-hidden">
            {/* Preview Banner */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-[#0F172A] px-6 py-3.5 text-white shrink-0">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-[#10B981]" />
                <span className="text-xs font-bold uppercase tracking-wider">Student View Preview</span>
              </div>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Simulated User Course Details View */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Course Hero */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#064E3B] to-[#10B981] p-6 text-white shadow-md">
                <span className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-xs">
                  {activeCourse.disasterType || (activeCourse as any).category} Course
                </span>
                <h1 className="text-2xl font-black">{activeCourse.title}</h1>
                <p className="mt-2 text-sm text-white/90 leading-relaxed">{activeCourse.description}</p>
                <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-white/80">
                  <span>⏱ {activeCourse.estimatedDuration || activeCourse.duration || "30 min"}</span>
                  <span>•</span>
                  <span>{activeCourse.difficulty || "Beginner"}</span>
                  <span>•</span>
                  <span>{activeCourse.lessons?.length || 0} Lessons</span>
                </div>
              </div>

              {/* Course Syllabus */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-[#0F172A]">Course Syllabus</h3>
                <div className="divide-y divide-[#E2E8F0] rounded-2xl border border-[#E2E8F0] bg-white shadow-2xs overflow-hidden">
                  {activeCourse.lessons?.map((lesson, idx) => (
                    <div key={lesson.id} className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#F1F5F9] text-xs font-black text-[#0F172A]">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-bold text-[#0F172A]">{lesson.title}</span>
                        </div>
                        <span className="rounded-full bg-[#ECFDF5] px-2.5 py-0.5 text-[10px] font-bold text-[#047857]">
                          Available
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] line-clamp-2">{lesson.content}</p>

                      {lesson.materials && lesson.materials.length > 0 && (
                        <div className="pt-2 flex flex-wrap gap-2">
                          {lesson.materials.map((mat) => (
                            <a
                              key={mat.id}
                              href={mat.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs font-bold text-[#0F172A] hover:border-[#10B981] hover:text-[#059669] transition"
                            >
                              {getMaterialIcon(mat.type)}
                              <span>{mat.title}</span>
                              <ExternalLink size={12} className="text-[#94A3B8]" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview Footer */}
            <div className="flex items-center justify-between border-t border-[#E2E8F0] bg-[#F8FAFC] px-6 py-4 shrink-0">
              <button
                onClick={() => {
                  setIsPreviewOpen(false);
                  setIsBuilderOpen(true);
                }}
                className="rounded-xl border border-[#CBD5E1] bg-white px-4 py-2.5 text-xs font-bold text-[#334155] hover:bg-[#F1F5F9] transition"
              >
                ← Back to Edit
              </button>

              <button
                onClick={() => handleTogglePublish(activeCourse)}
                className={`rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-98 ${
                  activeCourse.published || activeCourse.isPublished
                    ? "bg-[#DC2626] hover:bg-[#B91C1C]"
                    : "bg-[#10B981] hover:bg-[#059669]"
                }`}
              >
                {activeCourse.published || activeCourse.isPublished ? "Unpublish Course" : "Publish Course Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 8: DELETE CONFIRMATION ================= */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FEE2E2] text-[#DC2626]">
              <Trash2 size={24} />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#0F172A]">
                Delete {deleteConfirm.type === "course" ? "Course" : deleteConfirm.type === "lesson" ? "Lesson" : "Material"}?
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Are you sure you want to permanently delete <strong>&quot;{deleteConfirm.title}&quot;</strong>? This action
                cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#F1F5F9]">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded-xl border border-[#CBD5E1] bg-white px-4 py-2.5 text-xs font-bold text-[#334155] hover:bg-[#F1F5F9] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="rounded-xl bg-[#DC2626] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#B91C1C] shadow-sm transition active:scale-98"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
