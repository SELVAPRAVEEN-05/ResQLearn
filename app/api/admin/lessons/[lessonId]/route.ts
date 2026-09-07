import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { LessonUpdateSchema, detectMaterialTypeFromUrl } from "@/lib/validations/course";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const auth = await requireAdmin();
  if ("errorResponse" in auth) {
    return auth.errorResponse;
  }

  const { lessonId } = await params;

  try {
    const isNumeric = /^\d+$/.test(lessonId);
    const existingRes = await query(
      `SELECT id, lesson_id as "lessonId", course_id as "courseId", title, description, content, type,
              order_index as "order", is_published as "published", is_published,
              created_at as "createdAt", updated_at as "updatedAt"
       FROM resq_lessons
       WHERE ${isNumeric ? "id = $1 OR lesson_id = $2" : "lesson_id = $1"}`,
      isNumeric ? [parseInt(lessonId, 10), lessonId] : [lessonId]
    );

    if (existingRes.rows.length === 0) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const lesson = existingRes.rows[0];
    const matsRes = await query(
      `SELECT id, lesson_id as "lessonId", title, description, type, url,
              order_index as "order", created_at as "createdAt", updated_at as "updatedAt"
       FROM resq_materials
       WHERE lesson_id = $1
       ORDER BY order_index ASC, id ASC`,
      [lesson.id]
    );

    const materials = matsRes.rows;
    const videoMat = materials.find((m) => m.type === "VIDEO");
    const resourceMat = materials.find((m) => m.type !== "VIDEO");

    return NextResponse.json({
      lesson: {
        ...lesson,
        videoUrl: videoMat?.url || "",
        resourceUrl: resourceMat?.url || "",
        materials,
      },
    });
  } catch (error: any) {
    console.error("Admin get lesson error:", error);
    return NextResponse.json({ error: "Failed to fetch lesson" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const auth = await requireAdmin();
  if ("errorResponse" in auth) {
    return auth.errorResponse;
  }

  const { lessonId } = await params;

  try {
    const isNumeric = /^\d+$/.test(lessonId);
    const existingRes = await query(
      `SELECT id, course_id, title FROM resq_lessons WHERE ${isNumeric ? "id = $1 OR lesson_id = $2" : "lesson_id = $1"}`,
      isNumeric ? [parseInt(lessonId, 10), lessonId] : [lessonId]
    );

    if (existingRes.rows.length === 0) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const targetId = existingRes.rows[0].id;
    const body = await request.json();
    const parsed = LessonUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { title, description, content, type, order, published, videoUrl, resourceUrl, duration } = parsed.data;

    await query(
      `UPDATE resq_lessons
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           content = COALESCE($3, content),
           type = COALESCE($4, type),
           order_index = COALESCE($5, order_index),
           is_published = COALESCE($6, is_published),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7`,
      [
        title !== undefined ? title : null,
        description !== undefined ? description : null,
        content !== undefined ? content : null,
        type !== undefined ? type : null,
        order !== undefined ? order : null,
        published !== undefined ? published : null,
        targetId,
      ]
    );

    // Sync Video Material if videoUrl was passed in payload
    if (videoUrl !== undefined) {
      const trimmedVideo = videoUrl.trim();
      const existingVideo = await query(
        `SELECT id FROM resq_materials WHERE lesson_id = $1 AND type = 'VIDEO' ORDER BY id ASC LIMIT 1`,
        [targetId]
      );

      if (trimmedVideo) {
        if (existingVideo.rows.length > 0) {
          await query(
            `UPDATE resq_materials SET url = $1, title = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3`,
            [trimmedVideo, `${title || existingRes.rows[0].title} - Video Tutorial`, existingVideo.rows[0].id]
          );
        } else {
          await query(
            `INSERT INTO resq_materials (lesson_id, title, description, type, url, order_index, created_at, updated_at)
             VALUES ($1, $2, $3, 'VIDEO', $4, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [targetId, `${title || existingRes.rows[0].title} - Video Tutorial`, "Interactive Video Lesson", trimmedVideo]
          );
        }
      } else if (existingVideo.rows.length > 0) {
        // If explicitly set to empty string, delete the material and its progress
        await query(
          `DELETE FROM resq_user_material_progress WHERE material_id = $1`,
          [existingVideo.rows[0].id]
        );
        await query(
          `DELETE FROM resq_materials WHERE id = $1`,
          [existingVideo.rows[0].id]
        );
      }
    }

    // Sync Resource Material if resourceUrl was passed in payload
    if (resourceUrl !== undefined) {
      const trimmedResource = resourceUrl.trim();
      const existingResource = await query(
        `SELECT id FROM resq_materials WHERE lesson_id = $1 AND type != 'VIDEO' ORDER BY id ASC LIMIT 1`,
        [targetId]
      );

      if (trimmedResource) {
        const detectedType = detectMaterialTypeFromUrl(trimmedResource);
        if (existingResource.rows.length > 0) {
          await query(
            `UPDATE resq_materials SET url = $1, type = $2, title = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4`,
            [trimmedResource, detectedType, `${title || existingRes.rows[0].title} - Study Guide & Resource`, existingResource.rows[0].id]
          );
        } else {
          await query(
            `INSERT INTO resq_materials (lesson_id, title, description, type, url, order_index, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [targetId, `${title || existingRes.rows[0].title} - Study Guide & Resource`, "Educational Reference Material", detectedType, trimmedResource]
          );
        }
      } else if (existingResource.rows.length > 0) {
        // If explicitly set to empty string, delete the material and its progress
        await query(
          `DELETE FROM resq_user_material_progress WHERE material_id = $1`,
          [existingResource.rows[0].id]
        );
        await query(
          `DELETE FROM resq_materials WHERE id = $1`,
          [existingResource.rows[0].id]
        );
      }
    }

    // Fetch updated lesson and all its materials
    const updatedLessonRes = await query(
      `SELECT id, lesson_id as "lessonId", course_id as "courseId", title, description, content, type,
              order_index as "order", is_published as "published", is_published,
              created_at as "createdAt", updated_at as "updatedAt"
       FROM resq_lessons
       WHERE id = $1`,
      [targetId]
    );

    const matsRes = await query(
      `SELECT id, lesson_id as "lessonId", title, description, type, url,
              order_index as "order", created_at as "createdAt", updated_at as "updatedAt"
       FROM resq_materials
       WHERE lesson_id = $1
       ORDER BY order_index ASC, id ASC`,
      [targetId]
    );

    const materials = matsRes.rows;
    const vMat = materials.find((m) => m.type === "VIDEO");
    const rMat = materials.find((m) => m.type !== "VIDEO");

    return NextResponse.json({
      message: "Lesson updated successfully",
      lesson: {
        ...updatedLessonRes.rows[0],
        videoUrl: vMat?.url || "",
        resourceUrl: rMat?.url || "",
        duration: duration || "",
        materials,
      },
    });
  } catch (error: any) {
    console.error("Update lesson error:", error);
    return NextResponse.json({ error: "Failed to update lesson" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const auth = await requireAdmin();
  if ("errorResponse" in auth) {
    return auth.errorResponse;
  }

  const { lessonId } = await params;

  try {
    const isNumeric = /^\d+$/.test(lessonId);
    const existingRes = await query(
      `SELECT id FROM resq_lessons WHERE ${isNumeric ? "id = $1 OR lesson_id = $2" : "lesson_id = $1"}`,
      isNumeric ? [parseInt(lessonId, 10), lessonId] : [lessonId]
    );

    if (existingRes.rows.length === 0) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const targetId = existingRes.rows[0].id;

    // Relational cleanup
    await query(
      `DELETE FROM resq_user_material_progress WHERE material_id IN (SELECT id FROM resq_materials WHERE lesson_id = $1)`,
      [targetId]
    );
    await query(
      `DELETE FROM resq_user_lesson_progress WHERE lesson_id = $1`,
      [targetId]
    );
    await query(
      `DELETE FROM resq_materials WHERE lesson_id = $1`,
      [targetId]
    );
    await query(
      `DELETE FROM resq_lessons WHERE id = $1`,
      [targetId]
    );

    return NextResponse.json({ message: "Lesson deleted successfully" });
  } catch (error: any) {
    console.error("Delete lesson error:", error);
    return NextResponse.json({ error: "Failed to delete lesson" }, { status: 500 });
  }
}
