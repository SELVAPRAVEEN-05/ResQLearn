import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { CourseCreateSchema, detectMaterialTypeFromUrl } from "@/lib/validations/course";

export async function GET() {
  const auth = await requireAdmin();
  if ("errorResponse" in auth) {
    return auth.errorResponse;
  }

  try {
    const coursesRes = await query(
      `SELECT c.id, c.slug, c.title, c.description, c.category as "disasterType", c.category,
              c.icon_name as "iconName", c.duration as "estimatedDuration", c.duration,
              c.thumbnail, c.difficulty, c.is_published as "published", c.is_published,
              c.created_at as "createdAt", c.updated_at as "updatedAt",
              COUNT(DISTINCT l.id)::int as "lessonCount",
              COUNT(DISTINCT m.id)::int as "materialCount"
       FROM resq_courses c
       LEFT JOIN resq_lessons l ON c.id = l.course_id
       LEFT JOIN resq_materials m ON l.id = m.lesson_id
       GROUP BY c.id
       ORDER BY c.id DESC`
    );

    return NextResponse.json({ courses: coursesRes.rows });
  } catch (error: any) {
    console.error("Admin fetch courses error:", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("errorResponse" in auth) {
    return auth.errorResponse;
  }

  try {
    const body = await request.json();
    const parsed = CourseCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      disasterType,
      thumbnail,
      difficulty,
      estimatedDuration,
      published,
      iconName,
      videoUrl,
      resourceUrl,
    } = parsed.data;

    const baseSlug = (parsed.data.slug || title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Ensure slug uniqueness
    let slug = baseSlug;
    const existing = await query("SELECT id FROM resq_courses WHERE slug = $1", [slug]);
    if (existing.rows.length > 0) {
      slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    }

    const assignedIcon =
      iconName ||
      (disasterType === "Flood"
        ? "Droplet"
        : disasterType === "Fire"
        ? "Flame"
        : disasterType === "Cyclone"
        ? "Wind"
        : disasterType === "Earthquake"
        ? "Activity"
        : disasterType === "Heatwave"
        ? "Sun"
        : "BookOpen");

    const courseRes = await query(
      `INSERT INTO resq_courses (slug, title, description, category, thumbnail, difficulty, duration, icon_name, is_published, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, slug, title, description, category as "disasterType", thumbnail, difficulty, duration as "estimatedDuration", icon_name as "iconName", is_published as "published", created_at as "createdAt"`,
      [slug, title, description, disasterType, thumbnail || null, difficulty, estimatedDuration, assignedIcon, published]
    );

    const createdCourse = courseRes.rows[0];

    // If initial videoUrl or resourceUrl were provided during course creation, create Lesson 1 automatically
    if ((videoUrl && videoUrl.trim()) || (resourceUrl && resourceUrl.trim())) {
      const lessonSlug = `${slug}-lesson-1`;
      const lessonTitle = `Introduction to ${title}`;
      const lessonDesc = `Essential fundamentals and overview for ${disasterType} preparedness.`;
      const lessonContent = description || `Learn essential safety protocols and response measures for ${title}.`;

      const lessonRes = await query(
        `INSERT INTO resq_lessons (lesson_id, course_id, title, description, content, type, order_index, is_published, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, 'document', 0, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id`,
        [lessonSlug, createdCourse.id, lessonTitle, lessonDesc, lessonContent, published]
      );

      const lessonId = lessonRes.rows[0].id;
      let orderIdx = 0;

      if (videoUrl && videoUrl.trim()) {
        await query(
          `INSERT INTO resq_materials (lesson_id, title, description, type, url, order_index, created_at, updated_at)
           VALUES ($1, $2, $3, 'VIDEO', $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [lessonId, `${title} - Core Video`, "Official instructional video", videoUrl.trim(), orderIdx++]
        );
      }

      if (resourceUrl && resourceUrl.trim()) {
        const rType = detectMaterialTypeFromUrl(resourceUrl.trim());
        await query(
          `INSERT INTO resq_materials (lesson_id, title, description, type, url, order_index, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [lessonId, `${title} - Study Guide`, "Official preparedness reference guide", rType, resourceUrl.trim(), orderIdx++]
        );
      }
    }

    return NextResponse.json(
      { message: "Course created successfully", course: createdCourse },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create course error:", error);
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}
