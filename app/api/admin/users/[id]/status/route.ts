import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const userRes = await query("SELECT status FROM resq_users WHERE id = $1", [id]);
    if (userRes.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentStatus = userRes.rows[0].status;
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";

    await query("UPDATE resq_users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [newStatus, id]);

    return NextResponse.json({ message: "Status updated", status: newStatus });
  } catch (error: any) {
    console.error("Toggle user status error:", error);
    return NextResponse.json({ error: "Failed to toggle status" }, { status: 500 });
  }
}
