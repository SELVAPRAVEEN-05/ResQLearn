import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { CourseUpdateSchema } from "@/lib/validations/course";

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
      `SELECT id, slug, title, description, category as "disasterType", category,
              thumbnail, difficulty, duration as "estimatedDuration", duration,
              icon_name as "iconName", is_published as "published", is_published,
              created_at as "createdAt", updated_at as "updatedAt"
       FROM resq_courses
       WHERE ${isNumeric ? "id = $1 OR slug = $2" : "slug = $1"}`,
      isNumeric ? [parseInt(id, 10), id] : [id]
    );

    if (courseRes.rows.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const course = courseRes.rows[0];

    // Fetch lessons with their materials
    const lessonsRes = await query(
      `SELECT id, lesson_id as "lessonId", course_id as "courseId", title, description, content, type,
              order_index as "order", is_published as "published", is_published,
              created_at as "createdAt", updated_at as "updatedAt"
       FROM resq_lessons
       WHERE course_id = $1
       ORDER BY order_index ASC, id ASC`,
      [course.id]
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

    return NextResponse.json({
      course: {
        ...course,
        lessons,
      },
    });
  } catch (error: any) {
    console.error("Admin fetch course detail error:", error);
    return NextResponse.json({ error: "Failed to fetch course details" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("errorResponse" in auth) {
    return auth.errorResponse;
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = CourseUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const isNumeric = /^\d+$/.test(id);
    const existingRes = await query(
      `SELECT id FROM resq_courses WHERE ${isNumeric ? "id = $1 OR slug = $2" : "slug = $1"}`,
      isNumeric ? [parseInt(id, 10), id] : [id]
    );

    if (existingRes.rows.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const courseId = existingRes.rows[0].id;
    const { title, description, disasterType, thumbnail, difficulty, estimatedDuration, published, iconName } = parsed.data;

    const result = await query(
      `UPDATE resq_courses
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           category = COALESCE($3, category),
           thumbnail = COALESCE($4, thumbnail),
           difficulty = COALESCE($5, difficulty),
           duration = COALESCE($6, duration),
           icon_name = COALESCE($7, icon_name),
           is_published = COALESCE($8, is_published),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING id, slug, title, description, category as "disasterType", thumbnail, difficulty, duration as "estimatedDuration", icon_name as "iconName", is_published as "published", updated_at as "updatedAt"`,
      [
        title !== undefined ? title : null,
        description !== undefined ? description : null,
        disasterType !== undefined ? disasterType : null,
        thumbnail !== undefined ? thumbnail : null,
        difficulty !== undefined ? difficulty : null,
        estimatedDuration !== undefined ? estimatedDuration : null,
        iconName !== undefined ? iconName : null,
        published !== undefined ? published : null,
        courseId,
      ]
    );

    return NextResponse.json({ message: "Course updated successfully", course: result.rows[0] });
  } catch (error: any) {
    console.error("Update course error:", error);
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 });
  }
}

export async function DELETE(
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
    const existingRes = await query(
      `SELECT id FROM resq_courses WHERE ${isNumeric ? "id = $1 OR slug = $2" : "slug = $1"}`,
      isNumeric ? [parseInt(id, 10), id] : [id]
    );

    if (existingRes.rows.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const courseId = existingRes.rows[0].id;

    // Relational cascade cleanup
    await query(
      `DELETE FROM resq_user_material_progress WHERE material_id IN (SELECT id FROM resq_materials WHERE lesson_id IN (SELECT id FROM resq_lessons WHERE course_id = $1))`,
      [courseId]
    );
    await query(
      `DELETE FROM resq_user_lesson_progress WHERE lesson_id IN (SELECT id FROM resq_lessons WHERE course_id = $1)`,
      [courseId]
    );
    await query(
      `DELETE FROM resq_user_course_progress WHERE course_id = $1`,
      [courseId]
    );
    await query(
      `DELETE FROM resq_materials WHERE lesson_id IN (SELECT id FROM resq_lessons WHERE course_id = $1)`,
      [courseId]
    );
    await query(
      `DELETE FROM resq_lessons WHERE course_id = $1`,
      [courseId]
    );
    await query(
      `DELETE FROM resq_courses WHERE id = $1`,
      [courseId]
    );

    return NextResponse.json({ message: "Course and related lessons/materials deleted successfully" });
  } catch (error: any) {
    console.error("Delete course error:", error);
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 });
  }
}
