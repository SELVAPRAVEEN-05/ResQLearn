import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { MaterialUpdateSchema } from "@/lib/validations/course";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ materialId: string }> }
) {
  const auth = await requireAdmin();
  if ("errorResponse" in auth) {
    return auth.errorResponse;
  }

  const { materialId } = await params;

  try {
    const isNumeric = /^\d+$/.test(materialId);
    if (!isNumeric) {
      return NextResponse.json({ error: "Invalid material ID" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = MaterialUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { title, description, type, url, order } = parsed.data;

    const result = await query(
      `UPDATE resq_materials
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           type = COALESCE($3, type),
           url = COALESCE($4, url),
           order_index = COALESCE($5, order_index),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING id, lesson_id as "lessonId", title, description, type, url, order_index as "order", updated_at as "updatedAt"`,
      [
        title !== undefined ? title : null,
        description !== undefined ? description : null,
        type !== undefined ? type : null,
        url !== undefined ? url : null,
        order !== undefined ? order : null,
        parseInt(materialId, 10),
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Material updated successfully", material: result.rows[0] });
  } catch (error: any) {
    console.error("Update material error:", error);
    return NextResponse.json({ error: "Failed to update material" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ materialId: string }> }
) {
  const auth = await requireAdmin();
  if ("errorResponse" in auth) {
    return auth.errorResponse;
  }

  const { materialId } = await params;

  try {
    const isNumeric = /^\d+$/.test(materialId);
    if (!isNumeric) {
      return NextResponse.json({ error: "Invalid material ID" }, { status: 400 });
    }

    const result = await query(
      "DELETE FROM resq_materials WHERE id = $1 RETURNING id",
      [parseInt(materialId, 10)]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Material deleted successfully" });
  } catch (error: any) {
    console.error("Delete material error:", error);
    return NextResponse.json({ error: "Failed to delete material" }, { status: 500 });
  }
}
