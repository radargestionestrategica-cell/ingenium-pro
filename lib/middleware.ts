import { NextRequest, NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "./auth";

/** Public routes that never require authentication. */
const PUBLIC_ROUTES = ["/", "/api/pago"];

/** Routes that authenticated users should be redirected away from. */
const AUTH_ROUTES = ["/login", "/register"];

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.includes(pathname);
}

/**
 * Wraps a route handler so that only authenticated users can access it.
 * Returns 401 JSON when no session is present.
 */
export function withAuth(
  handler: (req: NextRequest, session: Session) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const session = await auth() as Session | null;
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    return handler(req, session);
  };
}

/**
 * Core middleware logic — call this from your root middleware.ts.
 * Redirects unauthenticated users to "/" and authenticated users
 * away from auth-only pages (login/register).
 */
export async function handleAuthMiddleware(
  request: NextRequest
): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const session = await auth();

  if (isAuthRoute(pathname) && session?.user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!session?.user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}
