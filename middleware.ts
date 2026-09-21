import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

function hasAdminAccess(role: string): boolean {
  return role === "admin" || role === "faculty";
}

const JWT_SECRET =
  process.env.JWT_SECRET || "resqlearn_super_secret_jwt_key_2026_safe_guard";
const key = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isStudentRoute = pathname.startsWith("/user");

  if (!isAdminRoute && !isStudentRoute) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, key);
    const role = payload.role as string;

    if (isAdminRoute && !hasAdminAccess(role)) {
      return NextResponse.redirect(new URL("/user/dashboard", request.url));
    }

    if (isStudentRoute && role !== "student" && !hasAdminAccess(role)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/user/:path*"],
};
