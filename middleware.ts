import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const role = request.cookies.get('role')?.value;

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isStudentRoute = request.nextUrl.pathname.startsWith('/user');
  
  if (!role) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAdminRoute && role !== 'admin') {
    return NextResponse.redirect(new URL('/user/dashboard', request.url));
  }
  
  if (isStudentRoute && role !== 'student') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/user/:path*'],
};
