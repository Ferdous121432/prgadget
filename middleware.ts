import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Handle cart session ID
  const existingCartId = request.cookies.get("sessionCartId");

  if (!existingCartId) {
    const sessionCartId = crypto.randomUUID();

    const response = NextResponse.next();
    response.cookies.set("sessionCartId", sessionCartId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
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
     * - images (static images)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
  ],
};
