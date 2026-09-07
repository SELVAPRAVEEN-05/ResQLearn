import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || "resqlearn_super_secret_jwt_key_2026_safe_guard";
const key = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin');
  const isStudentRoute = pathname.startsWith('/user');

  if (!isAdminRoute && !isStudentRoute) {
    return NextResponse.next();
  }

  if (!token) {
    // Also check role cookie as fallback during transition
    const roleCookie = request.cookies.get('role')?.value;
    if (roleCookie) {
      if (isAdminRoute && roleCookie !== 'admin') {
        return NextResponse.redirect(new URL('/user/dashboard', request.url));
      }
      if (isStudentRoute && roleCookie !== 'student' && roleCookie !== 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, key);
    const role = payload.role as string;

    if (isAdminRoute && role !== 'admin') {
      return NextResponse.redirect(new URL('/user/dashboard', request.url));
    }

    if (isStudentRoute && role !== 'student' && role !== 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*', '/user/:path*'],
};
