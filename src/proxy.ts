import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function proxy(request: NextRequest) {
  // update user's auth session
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - api/tmdb/ (public, CDN-cached TMDB proxy that never needs the session)
     * - icons/ and static files in public (sw.js, manifest.json, images, etc.)
     * - router prefetch requests (the real navigation still runs the proxy)
     * Every match is a billed edge invocation, so keep this list tight.
     */
    {
      source:
        "/((?!_next/static|_next/image|api/tmdb/|icons/|favicon.ico|sw.js|manifest.json|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|css|json|txt|xml|woff2?)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
