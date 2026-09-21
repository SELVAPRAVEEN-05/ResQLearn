import { NextResponse } from "next/server";

import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if ("errorResponse" in auth) return auth.errorResponse;

  const { id } = await params;

  try {
    const isNumeric = /^\d+$/.test(id);

    if (isNumeric) {
      await query(
        "DELETE FROM resq_quiz_questions WHERE id = $1 OR question_id = $2",
        [parseInt(id, 10), id],
      );
    } else {
      await query("DELETE FROM resq_quiz_questions WHERE question_id = $1", [
        id,
      ]);
    }

    return NextResponse.json({ message: "Question deleted successfully" });
  } catch (error: any) {
    console.error("Delete quiz question error:", error);

    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 },
    );
  }
}
