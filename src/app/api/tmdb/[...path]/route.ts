import { env } from "@/utils/env";
import { NextRequest } from "next/server";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const HOUR = 60 * 60;
const DAY = 24 * HOUR;

/** Only the endpoints the app uses, with how long the CDN may cache them (seconds). */
const ROUTES: { pattern: RegExp; ttl: number }[] = [
  { pattern: /^(movie|tv)\/(popular|top_rated)$/, ttl: HOUR },
  { pattern: /^movie\/(now_playing|upcoming)$/, ttl: HOUR },
  { pattern: /^tv\/on_the_air$/, ttl: HOUR },
  { pattern: /^trending\/(movie|tv)\/(day|week)$/, ttl: HOUR },
  { pattern: /^discover\/(movie|tv)$/, ttl: HOUR },
  { pattern: /^search\/(movie|tv)$/, ttl: HOUR },
  { pattern: /^genre\/(movie|tv)\/list$/, ttl: 7 * DAY },
  { pattern: /^(movie|tv)\/\d+$/, ttl: 6 * HOUR },
  { pattern: /^tv\/\d+\/season\/\d+$/, ttl: 6 * HOUR },
];

const APPEND_TO_RESPONSE = new Set([
  "images",
  "videos",
  "credits",
  "recommendations",
  "similar",
]);

/** Rebuilds the query string from allowed params only, in a fixed order. */
const sanitizeParams = (searchParams: URLSearchParams): URLSearchParams | null => {
  const params = new URLSearchParams();

  const page = searchParams.get("page");
  if (page !== null) {
    const n = Number(page);
    if (!Number.isInteger(n) || n < 1 || n > 500) return null;
    params.set("page", String(n));
  }

  const query = searchParams.get("query");
  if (query !== null) {
    const q = query.trim();
    if (!q || q.length > 100) return null;
    params.set("query", q);
  }

  const genres = searchParams.get("with_genres");
  if (genres !== null) {
    if (!/^[\d,|]*$/.test(genres)) return null;
    if (genres) params.set("with_genres", genres);
  }

  const append = searchParams.get("append_to_response");
  if (append !== null) {
    const values = append.split(",").filter(Boolean);
    if (!values.every((v) => APPEND_TO_RESPONSE.has(v))) return null;
    if (values.length) params.set("append_to_response", values.join(","));
  }

  const imageLanguage = searchParams.get("include_image_language");
  if (imageLanguage !== null) {
    if (!/^[a-z]{2}(,[a-z]{2}|,null)*$|^null$/.test(imageLanguage)) return null;
    params.set("include_image_language", imageLanguage);
  }

  return params;
};

const cacheHeaders = (ttl: number) => ({
  "Cache-Control": `public, max-age=${Math.min(ttl, 300)}`,
  "CDN-Cache-Control": `public, s-maxage=${ttl}, stale-while-revalidate=${DAY}`,
});

const notFound = () =>
  Response.json({ success: false, status_message: "Not found" }, { status: 404 });

export const GET = async (request: NextRequest, ctx: RouteContext<"/api/tmdb/[...path]">) => {
  // block other sites from using this route (only checked on CDN cache misses)
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") {
    return Response.json({ success: false, status_message: "Forbidden" }, { status: 403 });
  }

  const { path } = await ctx.params;
  const endpoint = path.join("/");
  const route = ROUTES.find(({ pattern }) => pattern.test(endpoint));
  if (!route) return notFound();

  const params = sanitizeParams(request.nextUrl.searchParams);
  if (!params) {
    return Response.json({ success: false, status_message: "Invalid parameters" }, { status: 400 });
  }

  const upstream = await fetch(`${TMDB_BASE_URL}/${endpoint}?${params}`, {
    headers: { Authorization: `Bearer ${env.TMDB_ACCESS_TOKEN}` },
    cache: "no-store",
  });

  const headers: Record<string, string> = { "Content-Type": "application/json; charset=utf-8" };

  if (upstream.ok) Object.assign(headers, cacheHeaders(route.ttl));
  else if (upstream.status === 404) Object.assign(headers, cacheHeaders(60));
  else headers["Cache-Control"] = "no-store";

  return new Response(upstream.body, { status: upstream.status, headers });
};
