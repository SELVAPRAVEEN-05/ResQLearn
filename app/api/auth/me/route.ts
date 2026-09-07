import { NextResponse } from "next/server";
import { getSessionUser, getUserById } from "@/lib/auth";

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = await getUserById(session.id);
  if (!user) {
    return NextResponse.json({ user: null }, { status: 404 });
  }

  return NextResponse.json({ user });
}
