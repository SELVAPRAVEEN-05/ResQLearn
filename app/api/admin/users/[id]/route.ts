import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await query("DELETE FROM resq_users WHERE id = $1", [id]);
    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error: any) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
