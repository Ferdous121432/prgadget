import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((request) => {
  console.log("🔥 Middleware running for:", request.nextUrl.pathname);

  // Array of regex patterns to match paths that should be protected
  const protectedPaths = [
    /^\/shipping-address/, // Shipping address
    /^\/payment-method/, // Payment method
    /^\/place-order/, // Place order
    /^\/user\/(.*)/, // User routes
    /^\/order\/(.*)/, // Order routes
    /^\/admin/, // Admin routes
    /^\/profile/, // Profile routes
  ];

  // Get the pathname from the request
  const { pathname } = request.nextUrl;

  // Check if user is not authenticated and accessing a protected path
  if (
    !request.auth &&
    protectedPaths.some((pattern) => pattern.test(pathname))
  ) {
    // Redirect to sign-in page with callback URL
    const signInUrl = new URL("/sign-in", request.nextUrl.origin);
    // Set the callback URL to the current pathname
    signInUrl.searchParams.set("callbackUrl", pathname);
    console.log("🔒 Redirecting to sign-in:", signInUrl.toString());
    return NextResponse.redirect(signInUrl);
  }

  // Check for existing cart cookie
  const existingCartId = request.cookies.get("sessionCartId");

  if (!existingCartId) {
    const sessionCartId = crypto.randomUUID();
    console.log("🍪 Generating new session cart ID:", sessionCartId);

    // Create response first
    const response = NextResponse.next({
      request: {
        headers: new Headers(request.headers),
      },
    });

    // Set the cookie with proper attributes
    response.cookies.set("sessionCartId", sessionCartId, {
      httpOnly: false, // Allow client-side access
      secure: false, // Set to false for development
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    console.log("🍪 Cookie set successfully");
    return response;
  } else {
    console.log("🍪 Session cart ID already exists:", existingCartId.value);
  }

  return NextResponse.next();
});

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
