import type { TMDB } from "tmdb-ts";

type Params = Record<string, string | number | undefined>;

/**
 * Fetches TMDB data through our cached `/api/tmdb` route, so the access token never
 * reaches the browser. Query keys are sorted to keep URLs (and CDN cache keys) stable.
 */
const get = async <T>(path: string, params: Params = {}): Promise<T> => {
  const search = new URLSearchParams();
  Object.keys(params)
    .sort()
    .forEach((key) => {
      const value = params[key];
      if (value !== undefined && value !== "") search.set(key, String(value));
    });

  const query = search.toString();
  const response = await fetch(`/api/tmdb/${path}${query ? `?${query}` : ""}`);

  if (!response.ok) return Promise.reject(await response.json().catch(() => response.statusText));
  return response.json();
};

const pageOnly = (options?: { page?: number }) => ({ page: options?.page });

const details =
  (type: "movie" | "tv") =>
  (id: number, appendToResponse?: string[]) =>
    get(`${type}/${id}`, {
      append_to_response: appendToResponse?.join(","),
      // images of every language are the heaviest part of the response, keep only what we show
      include_image_language: appendToResponse?.includes("images") ? "en,null" : undefined,
    });

/** Browser-safe subset of `tmdb-ts` with the same method signatures. */
export const tmdb = {
  movies: {
    details: details("movie") as TMDB["movies"]["details"],
    popular: ((options) => get("movie/popular", pageOnly(options))) as TMDB["movies"]["popular"],
    nowPlaying: ((options) =>
      get("movie/now_playing", pageOnly(options))) as TMDB["movies"]["nowPlaying"],
    upcoming: ((options) => get("movie/upcoming", pageOnly(options))) as TMDB["movies"]["upcoming"],
    topRated: ((options) =>
      get("movie/top_rated", pageOnly(options))) as TMDB["movies"]["topRated"],
  },
  tvShows: {
    details: details("tv") as TMDB["tvShows"]["details"],
    season: ((id, season) => get(`tv/${id}/season/${season}`)) as TMDB["tvShows"]["season"],
    popular: ((options) => get("tv/popular", pageOnly(options))) as TMDB["tvShows"]["popular"],
    onTheAir: ((options) => get("tv/on_the_air", pageOnly(options))) as TMDB["tvShows"]["onTheAir"],
    topRated: ((options) => get("tv/top_rated", pageOnly(options))) as TMDB["tvShows"]["topRated"],
  },
  trending: {
    trending: ((mediaType, timeWindow, options) =>
      get(`trending/${mediaType}/${timeWindow}`, pageOnly(options))) as TMDB["trending"]["trending"],
  },
  discover: {
    movie: ((options) =>
      get("discover/movie", {
        page: options?.page,
        with_genres: options?.with_genres,
      })) as TMDB["discover"]["movie"],
    tvShow: ((options) =>
      get("discover/tv", {
        page: options?.page,
        with_genres: options?.with_genres,
      })) as TMDB["discover"]["tvShow"],
  },
  search: {
    movies: ((options) =>
      get("search/movie", { query: options.query, page: options.page })) as TMDB["search"]["movies"],
    tvShows: ((options) =>
      get("search/tv", { query: options.query, page: options.page })) as TMDB["search"]["tvShows"],
  },
  genres: {
    movies: (() => get("genre/movie/list")) as TMDB["genres"]["movies"],
    tvShows: (() => get("genre/tv/list")) as TMDB["genres"]["tvShows"],
  },
};
