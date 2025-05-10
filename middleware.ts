import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server"; // Keep if you might add custom logic later

// Define protected routes (e.g., admin dashboard)
const isProtectedRoute = createRouteMatcher([
  "/admin(.*)", // Protect all routes starting with /admin
]);

export default clerkMiddleware((auth, req) => {
  // Check if the current route is protected
  if (isProtectedRoute(req)) {
    // If it's a protected route, ensure the user is authenticated
    // auth.protect() will automatically redirect unauthenticated users
    // to the sign-in page, or handle it based on your Clerk settings.
    auth.protect();
  }

  // For all other routes (including /onboarding, /, etc.),
  // allow the request to proceed without custom checks here.
  // Clerk's default behavior for sign-in/sign-up will apply.
  // console.log(`Middleware: Allowing request for path: ${req.nextUrl.pathname}`);
  // return NextResponse.next(); // You can explicitly return next() if preferred
});

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and API routes used by Clerk
    "/((?!_next|static|favicon.ico|api/webhook).*)",
    // Optionally include API routes if you want middleware to run on them
    // '/(api|trpc)(.*)',
  ],
};
