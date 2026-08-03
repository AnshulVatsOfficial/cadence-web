import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Private routes that require authentication
const privateRoutePrefixes = ["/projects"];

// Public auth pages where logged-in users are redirected to /projects
const publicAuthPages = ["/login", "/signup"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoggedIn = request.cookies.has("cadence_logged_in");

  const isPrivateKeyRoute = privateRoutePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isPublicAuthPage = publicAuthPages.includes(pathname);

  // 1. Unauthenticated user trying to access private route (/projects, /projects/[id]) -> Redirect to /login
  if (isPrivateKeyRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated user trying to access /login or /signup -> Redirect to /projects
  if (isPublicAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/projects", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files, icons, and images
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)",
  ],
};
