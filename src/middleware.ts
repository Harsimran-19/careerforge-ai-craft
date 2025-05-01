import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  const isAuthenticated = !!session;
  const isAuthPage = request.nextUrl.pathname === '/login' || 
                    request.nextUrl.pathname === '/register';
  const isRootPage = request.nextUrl.pathname === '/';
  const isOnboardingPage = request.nextUrl.pathname === '/onboarding';

  // If user is not authenticated and tries to access protected routes
  if (!isAuthenticated && 
      !isAuthPage && 
      !isRootPage && 
      !isOnboardingPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is authenticated and tries to access auth pages (login/register)
  if (isAuthenticated && (isAuthPage || isRootPage)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// See https://nextjs.org/docs/app/building-your-application/routing/middleware
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
