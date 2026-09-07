import { z } from "zod";

export const DisasterTypes = [
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

export const MaterialTypes = [
  "PDF",
  "VIDEO",
  "WEBSITE",
  "ARTICLE",
  "IMAGE",
  "DOCUMENT",
  "EXTERNAL_RESOURCE",
] as const;

export const Difficulties = ["Beginner", "Intermediate", "Advanced"] as const;

export const CourseCreateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255),
  slug: z.string().optional(),
  description: z.string().min(5, "Description must be at least 5 characters"),
  disasterType: z.enum(DisasterTypes).default("Flood"),
  thumbnail: z.string().optional().or(z.literal("")),
  difficulty: z.enum(Difficulties).default("Beginner"),
  estimatedDuration: z.string().min(1, "Estimated duration is required").default("30 min"),
  published: z.boolean().default(false),
  iconName: z.string().optional().default("Droplet"),
  videoUrl: z.string().optional().or(z.literal("")),
  resourceUrl: z.string().optional().or(z.literal("")),
});

export const CourseUpdateSchema = CourseCreateSchema.partial();

export const LessonCreateSchema = z.object({
  title: z.string().min(2, "Lesson title must be at least 2 characters").max(255),
  description: z.string().optional().default(""),
  content: z.string().optional().default(""),
  type: z.string().default("document"),
  order: z.number().int().nonnegative().optional().default(0),
  published: z.boolean().optional().default(true),
  videoUrl: z.string().optional().or(z.literal("")),
  resourceUrl: z.string().optional().or(z.literal("")),
  duration: z.string().optional().or(z.literal("")),
});

export const LessonUpdateSchema = LessonCreateSchema.partial();

export const MaterialCreateSchema = z.object({
  title: z.string().min(2, "Material title must be at least 2 characters").max(255),
  description: z.string().optional().default(""),
  type: z.enum(MaterialTypes),
  url: z.string().min(1, "URL or path is required").refine(
    (val) => {
      const trimmed = val.trim();
      return (
        trimmed.startsWith("/") ||
        trimmed.startsWith("http://") ||
        trimmed.startsWith("https://") ||
        trimmed.startsWith("blob:") ||
        trimmed.startsWith("data:")
      );
    },
    { message: "Must be a valid web URL (http/https) or relative path (e.g. /docs/...)" }
  ),
  order: z.number().int().nonnegative().optional().default(0),
});

export const MaterialUpdateSchema = MaterialCreateSchema.partial();

export const AiSuggestCourseSchema = z.object({
  disasterType: z.string().min(2, "Disaster type is required"),
  topic: z.string().min(3, "Topic must be at least 3 characters"),
  audience: z.string().optional().default("Students & General Public"),
});

export type CourseCreateInput = z.infer<typeof CourseCreateSchema>;
export type CourseUpdateInput = z.infer<typeof CourseUpdateSchema>;
export type LessonCreateInput = z.infer<typeof LessonCreateSchema>;
export type LessonUpdateInput = z.infer<typeof LessonUpdateSchema>;
export type MaterialCreateInput = z.infer<typeof MaterialCreateSchema>;
export type MaterialUpdateInput = z.infer<typeof MaterialUpdateSchema>;
export type AiSuggestCourseInput = z.infer<typeof AiSuggestCourseSchema>;

/**
 * Robust helper to extract clean YouTube embed URL
 */
export function getYouTubeEmbedUrl(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})/i
  );
  return match ? `https://www.youtube.com/embed/${match[1]}?rel=0&enablejsapi=1` : null;
}

/**
 * Robust helper to check if URL is a PDF
 */
export function isPdfUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  const clean = url.trim().toLowerCase().split("?")[0].split("#")[0];
  return clean.endsWith(".pdf") || clean.includes("/docs/") || clean.includes("/pdf/");
}

/**
 * Utility helper to auto-detect material type from URL
 */
export function detectMaterialTypeFromUrl(url: string): typeof MaterialTypes[number] {
  if (!url || typeof url !== "string") return "WEBSITE";
  const trimmed = url.trim().toLowerCase();

  if (
    trimmed.includes("youtube.com") ||
    trimmed.includes("youtu.be") ||
    trimmed.includes("vimeo.com") ||
    trimmed.endsWith(".mp4") ||
    trimmed.endsWith(".webm") ||
    trimmed.endsWith(".mov")
  ) {
    return "VIDEO";
  }

  if (trimmed.endsWith(".pdf") || trimmed.includes(".pdf?") || trimmed.includes("/pdf/") || trimmed.includes("/docs/")) {
    return "PDF";
  }

  if (
    trimmed.endsWith(".png") ||
    trimmed.endsWith(".jpg") ||
    trimmed.endsWith(".jpeg") ||
    trimmed.endsWith(".webp") ||
    trimmed.endsWith(".svg") ||
    trimmed.endsWith(".gif")
  ) {
    return "IMAGE";
  }

  if (
    trimmed.endsWith(".doc") ||
    trimmed.endsWith(".docx") ||
    trimmed.endsWith(".ppt") ||
    trimmed.endsWith(".pptx") ||
    trimmed.endsWith(".xls") ||
    trimmed.endsWith(".xlsx") ||
    trimmed.endsWith(".txt")
  ) {
    return "DOCUMENT";
  }

  if (trimmed.includes("medium.com") || trimmed.includes("/blog/") || trimmed.includes("/article/")) {
    return "ARTICLE";
  }

  return "WEBSITE";
}

