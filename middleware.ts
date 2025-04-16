import {
  clerkMiddleware,
  createRouteMatcher,
  auth,
} from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { userId } = await auth();

  const { data: user } = await supabase
    .from("users")
    .select("clerk_id")
    .eq("clerk_id", userId)
    .single();

  const { data: restaurant } = await supabase
    .from("restaurant")
    .select("id")
    .eq("user_id", user?.clerk_id);

  const path = req.nextUrl.pathname;

  if (!restaurant && path !== "/onboarding") {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }
  if (restaurant && path == "/onboarding") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
