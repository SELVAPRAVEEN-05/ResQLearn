/**
 * Client API utility functions for Courses, Lessons, Materials, and Progress.
 */

export interface MaterialItem {
  id: number;
  lessonId: number;
  title: string;
  description?: string;
  type: "PDF" | "VIDEO" | "WEBSITE" | "ARTICLE" | "IMAGE" | "DOCUMENT" | "EXTERNAL_RESOURCE";
  url: string;
  order: number;
}

export interface LessonItem {
  id: number | string;
  lessonId?: string;
  courseId?: number;
  title: string;
  description?: string;
  content: string;
  type: string;
  order: number;
  published?: boolean;
  isPublished?: boolean;
  videoUrl?: string;
  resourceUrl?: string;
  duration?: string;
  status?: "locked" | "in-progress" | "completed";
  materials?: MaterialItem[];
}

export interface CourseItem {
  id: number;
  slug: string;
  title: string;
  description: string;
  disasterType: string;
  category?: string;
  thumbnail?: string;
  videoUrl?: string;
  resourceUrl?: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedDuration: string;
  duration?: string;
  published: boolean;
  isPublished?: boolean;
  iconName: string;
  lessonCount?: number;
  materialCount?: number;
  progress?: number;
  lessons?: LessonItem[];
  createdAt?: string;
  updatedAt?: string;
}

// ---------------- USER API CALLS ----------------

export async function getCourses(category?: string): Promise<{ courses: CourseItem[]; error?: string }> {
  try {
    const url = category && category !== "All" ? `/api/courses?category=${encodeURIComponent(category)}` : "/api/courses";
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to fetch courses" }));
      return { courses: [], error: err.error || "Failed to fetch courses" };
    }
    const data = await res.json();
    return { courses: data.courses || [] };
  } catch (error: any) {
    return { courses: [], error: error.message || "Network error fetching courses" };
  }
}

export async function getCourse(idOrSlug: string | number): Promise<{ course: CourseItem | null; error?: string }> {
  try {
    const res = await fetch(`/api/courses/${idOrSlug}`, { cache: "no-store" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Course not found" }));
      return { course: null, error: err.error || "Course not found" };
    }
    const data = await res.json();
    return { course: data.course };
  } catch (error: any) {
    return { course: null, error: error.message || "Network error" };
  }
}

export async function getLesson(lessonId: string | number): Promise<{ lesson: LessonItem | null; error?: string }> {
  try {
    const res = await fetch(`/api/lessons/${lessonId}`, { cache: "no-store" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Lesson not found" }));
      return { lesson: null, error: err.error || "Lesson not found" };
    }
    const data = await res.json();
    return { lesson: data.lesson };
  } catch (error: any) {
    return { lesson: null, error: error.message || "Network error" };
  }
}

export async function completeLesson(
  courseIdOrSlug: string | number,
  lessonId: string | number
): Promise<{ success: boolean; progressPercent?: number; error?: string }> {
  try {
    const res = await fetch(`/api/courses/${courseIdOrSlug}/lessons/${lessonId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Failed to mark lesson complete" };
    }
    return { success: true, progressPercent: data.progressPercent };
  } catch (error: any) {
    return { success: false, error: error.message || "Network error" };
  }
}

export async function getCourseProgress(courseIdOrSlug: string | number): Promise<{ progress: number; error?: string }> {
  try {
    const res = await fetch(`/api/courses/${courseIdOrSlug}/progress`, { cache: "no-store" });
    if (!res.ok) {
      return { progress: 0, error: "Failed to fetch progress" };
    }
    const data = await res.json();
    return { progress: data.progress || 0 };
  } catch (error: any) {
    return { progress: 0, error: error.message };
  }
}

// ---------------- ADMIN API CALLS ----------------

export async function getAdminCourses(): Promise<{ courses: CourseItem[]; error?: string }> {
  try {
    const res = await fetch("/api/admin/courses", { cache: "no-store" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to fetch admin courses" }));
      return { courses: [], error: err.error || "Failed to fetch admin courses" };
    }
    const data = await res.json();
    return { courses: data.courses || [] };
  } catch (error: any) {
    return { courses: [], error: error.message || "Network error" };
  }
}

export async function getAdminCourse(idOrSlug: string | number): Promise<{ course: CourseItem | null; error?: string }> {
  try {
    const res = await fetch(`/api/admin/courses/${idOrSlug}`, { cache: "no-store" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to fetch course details" }));
      return { course: null, error: err.error || "Failed to fetch course details" };
    }
    const data = await res.json();
    return { course: data.course };
  } catch (error: any) {
    return { course: null, error: error.message || "Network error" };
  }
}

export async function createCourse(data: any): Promise<{ course: CourseItem | null; error?: string }> {
  try {
    const res = await fetch("/api/admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) {
      return { course: null, error: resData.error || "Failed to create course" };
    }
    return { course: resData.course };
  } catch (error: any) {
    return { course: null, error: error.message || "Network error" };
  }
}

export async function updateCourse(id: string | number, data: any): Promise<{ course: CourseItem | null; error?: string }> {
  try {
    const res = await fetch(`/api/admin/courses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) {
      return { course: null, error: resData.error || "Failed to update course" };
    }
    return { course: resData.course };
  } catch (error: any) {
    return { course: null, error: error.message || "Network error" };
  }
}

export async function deleteCourse(id: string | number): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/admin/courses/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Failed to delete course" };
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Network error" };
  }
}

export async function publishCourse(id: string | number): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/admin/courses/${id}/publish`, {
      method: "POST",
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Failed to publish course" };
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Network error" };
  }
}

export async function unpublishCourse(id: string | number): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/admin/courses/${id}/unpublish`, {
      method: "POST",
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Failed to unpublish course" };
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Network error" };
  }
}

export async function createLesson(
  courseId: string | number,
  data: any
): Promise<{ lesson: LessonItem | null; error?: string }> {
  try {
    const res = await fetch(`/api/admin/courses/${courseId}/lessons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) {
      return { lesson: null, error: resData.error || "Failed to create lesson" };
    }
    return { lesson: resData.lesson };
  } catch (error: any) {
    return { lesson: null, error: error.message || "Network error" };
  }
}

export async function updateLesson(
  lessonId: string | number,
  data: any
): Promise<{ lesson: LessonItem | null; error?: string }> {
  try {
    const res = await fetch(`/api/admin/lessons/${lessonId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) {
      return { lesson: null, error: resData.error || "Failed to update lesson" };
    }
    return { lesson: resData.lesson };
  } catch (error: any) {
    return { lesson: null, error: error.message || "Network error" };
  }
}

export async function deleteLesson(lessonId: string | number): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/admin/lessons/${lessonId}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Failed to delete lesson" };
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Network error" };
  }
}

export async function addMaterial(
  lessonId: string | number,
  data: any
): Promise<{ material: MaterialItem | null; error?: string }> {
  try {
    const res = await fetch(`/api/admin/lessons/${lessonId}/materials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) {
      return { material: null, error: resData.error || "Failed to add material" };
    }
    return { material: resData.material };
  } catch (error: any) {
    return { material: null, error: error.message || "Network error" };
  }
}

export async function updateMaterial(
  materialId: string | number,
  data: any
): Promise<{ material: MaterialItem | null; error?: string }> {
  try {
    const res = await fetch(`/api/admin/materials/${materialId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) {
      return { material: null, error: resData.error || "Failed to update material" };
    }
    return { material: resData.material };
  } catch (error: any) {
    return { material: null, error: error.message || "Network error" };
  }
}

export async function deleteMaterial(materialId: string | number): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/admin/materials/${materialId}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Failed to delete material" };
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Network error" };
  }
}

export async function generateAiCourseStructure(
  disasterType: string,
  topic: string,
  audience?: string
): Promise<{ draft: any | null; error?: string }> {
  try {
    const res = await fetch("/api/admin/courses/ai-suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disasterType, topic, audience }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { draft: null, error: data.error || "Failed to generate AI course draft" };
    }
    return { draft: data.draft };
  } catch (error: any) {
    return { draft: null, error: error.message || "Network error" };
  }
}
