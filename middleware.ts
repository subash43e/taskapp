import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Define protected routes
  const protectedRoutes = ['/Inbox', '/Today', '/Upcoming', '/Completed', '/Settings'];

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // For server-side rendering, we can't check auth state directly
    // This middleware serves as an additional layer but relies on client-side checks
    // In a production app, you'd verify JWT tokens here

    // For now, we'll let the client-side ProtectedRoute component handle the auth check
    // But we can add additional server-side validation if needed
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};