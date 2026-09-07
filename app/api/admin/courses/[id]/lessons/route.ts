import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { LessonCreateSchema, detectMaterialTypeFromUrl } from "@/lib/validations/course";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("errorResponse" in auth) {
    return auth.errorResponse;
  }

  const { id } = await params;

  try {
    const isNumeric = /^\d+$/.test(id);
    const courseRes = await query(
      `SELECT id, slug FROM resq_courses WHERE ${isNumeric ? "id = $1 OR slug = $2" : "slug = $1"}`,
      isNumeric ? [parseInt(id, 10), id] : [id]
    );

    if (courseRes.rows.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const courseId = courseRes.rows[0].id;
    const lessonsRes = await query(
      `SELECT id, lesson_id as "lessonId", course_id as "courseId", title, description, content, type,
              order_index as "order", is_published as "published", is_published,
              created_at as "createdAt", updated_at as "updatedAt"
       FROM resq_lessons
       WHERE course_id = $1
       ORDER BY order_index ASC, id ASC`,
      [courseId]
    );

    const lessons = [];
    for (const l of lessonsRes.rows) {
      const matsRes = await query(
        `SELECT id, lesson_id as "lessonId", title, description, type, url,
                order_index as "order", created_at as "createdAt", updated_at as "updatedAt"
         FROM resq_materials
         WHERE lesson_id = $1
         ORDER BY order_index ASC, id ASC`,
        [l.id]
      );
      const materials = matsRes.rows;
      const videoMat = materials.find((m) => m.type === "VIDEO");
      const resourceMat = materials.find((m) => m.type !== "VIDEO");

      lessons.push({
        ...l,
        videoUrl: videoMat?.url || "",
        resourceUrl: resourceMat?.url || "",
        materials,
      });
    }

    return NextResponse.json({ lessons });
  } catch (error: any) {
    console.error("Admin fetch course lessons error:", error);
    return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("errorResponse" in auth) {
    return auth.errorResponse;
  }

  const { id } = await params;

  try {
    const isNumeric = /^\d+$/.test(id);
    const courseRes = await query(
      `SELECT id, slug FROM resq_courses WHERE ${isNumeric ? "id = $1 OR slug = $2" : "slug = $1"}`,
      isNumeric ? [parseInt(id, 10), id] : [id]
    );

    if (courseRes.rows.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const course = courseRes.rows[0];
    const body = await request.json();
    const parsed = LessonCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { title, description, content, type, published, videoUrl, resourceUrl, duration } = parsed.data;

    // Determine order
    let order = parsed.data.order;
    if (order === undefined || order === null) {
      const maxOrderRes = await query(
        `SELECT COALESCE(MAX(order_index), -1) + 1 as next_order FROM resq_lessons WHERE course_id = $1`,
        [course.id]
      );
      order = maxOrderRes.rows[0]?.next_order ?? 0;
    }

    const lessonSlug = `${course.slug}-lesson-${Date.now().toString().slice(-4)}`;

    const lessonContent = content && content.trim() ? content : (description || "Instructional guidance and emergency procedures.");

    const lessonRes = await query(
      `INSERT INTO resq_lessons (lesson_id, course_id, title, description, content, type, order_index, is_published, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, lesson_id as "lessonId", course_id as "courseId", title, description, content, type, order_index as "order", is_published as "published", created_at as "createdAt"`,
      [lessonSlug, course.id, title, description || "", lessonContent, type || "document", order, published ?? true]
    );

    const createdLesson = lessonRes.rows[0];
    const materials = [];

    // Automatically attach video link if provided
    if (videoUrl && videoUrl.trim()) {
      const vUrl = videoUrl.trim();
      const videoMatRes = await query(
        `INSERT INTO resq_materials (lesson_id, title, description, type, url, order_index, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id, lesson_id as "lessonId", title, description, type, url, order_index as "order", created_at as "createdAt"`,
        [createdLesson.id, `${title} - Video Tutorial`, "Interactive Video Lesson", "VIDEO", vUrl, 0]
      );
      materials.push(videoMatRes.rows[0]);
    }

    // Automatically attach resource link if provided
    if (resourceUrl && resourceUrl.trim()) {
      const rUrl = resourceUrl.trim();
      const detectedType = detectMaterialTypeFromUrl(rUrl);
      const resMatRes = await query(
        `INSERT INTO resq_materials (lesson_id, title, description, type, url, order_index, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id, lesson_id as "lessonId", title, description, type, url, order_index as "order", created_at as "createdAt"`,
        [createdLesson.id, `${title} - Study Guide & Resource`, "Educational Reference Material", detectedType, rUrl, materials.length]
      );
      materials.push(resMatRes.rows[0]);
    }

    return NextResponse.json(
      {
        message: "Lesson created successfully",
        lesson: {
          ...createdLesson,
          videoUrl: videoUrl?.trim() || "",
          resourceUrl: resourceUrl?.trim() || "",
          duration: duration || "",
          materials,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create lesson error:", error);
    return NextResponse.json({ error: "Failed to create lesson" }, { status: 500 });
  }
}
