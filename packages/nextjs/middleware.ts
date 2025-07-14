import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  if (process.env.NEXT_PUBLIC_USE_SUBDOMAINS !== "true") {
    return NextResponse.next();
  }

  if (host.includes("vercel.app") && !host.includes(process.env.NEXT_PUBLIC_CUSTOM_DOMAIN || "")) {
    return NextResponse.next();
  }

  const parts = host.split(".");
  let subdomain = null;

  if (parts.length >= 2) {
    const potentialSubdomain = parts[0];

    if (
      potentialSubdomain !== "www" &&
      potentialSubdomain !== "cohorts" &&
      !potentialSubdomain.includes("localhost:") &&
      potentialSubdomain !== "localhost"
    ) {
      if (/^[a-z0-9-]+$/i.test(potentialSubdomain)) {
        subdomain = potentialSubdomain;
      }
    }
  }

  if (!subdomain) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();

  if (pathname === "/") {
    url.pathname = `/cohort-subdomain/${subdomain}`;
  } else {
    url.pathname = `/cohort-subdomain/${subdomain}${pathname}`;
  }

  return NextResponse.rewrite(url);
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
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
