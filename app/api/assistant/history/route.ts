import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ messages: [] });
  }

  const userId = session.id;

  try {
    const historyRes = await query(
      `SELECT id, sender, message as text, created_at
       FROM resq_chat_messages
       WHERE user_id = $1
       ORDER BY created_at ASC
       LIMIT 50`,
      [userId]
    );

    return NextResponse.json({
      messages: historyRes.rows,
    });
  } catch (error: any) {
    console.error("Chat history error:", error);
    return NextResponse.json({ error: "Failed to fetch chat history" }, { status: 500 });
  }
}
