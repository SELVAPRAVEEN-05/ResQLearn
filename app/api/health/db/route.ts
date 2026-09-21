import { NextResponse } from "next/server";

import pool from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  try {
    await pool.query("SELECT 1");

    return NextResponse.json({ message: "Database connection successful" });
  } catch (error: any) {
    console.error("Database health check failed:", {
      code: error?.code,
      message: error?.message,
    });

    return NextResponse.json(
      { message: "Database connection failed" },
      { status: 503 },
    );
  }
}
