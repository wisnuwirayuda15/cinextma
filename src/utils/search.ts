import { tmdb } from "@/api/tmdb-client";
import { ActionResponse } from "@/types";
import { isEmpty } from "@/utils/helpers";
import { Movie, TV } from "tmdb-ts/dist/types";

export type SearchSuggestion = {
  id: number;
  title: string;
  type: "movie" | "tv";
};

/** Merges movie and TV results into unique titles, best matches first. */
export const buildSearchSuggestions = (
  query: string,
  movies: Movie[],
  tvShows: TV[],
  limit: number = 10,
): SearchSuggestion[] => {
  const queryLower = query.toLowerCase();

  const suggestions: SearchSuggestion[] = [
    ...movies.map((movie) => ({ id: movie.id, title: movie.title, type: "movie" as const })),
    ...tvShows.map((tv) => ({ id: tv.id, title: tv.name, type: "tv" as const })),
  ];

  return suggestions
    .filter((data) => data.title.toLowerCase().includes(queryLower))
    .filter(
      (data, index, self) =>
        index === self.findIndex((t) => t.title.toLowerCase() === data.title.toLowerCase()),
    )
    .sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();

      const aStartsWith = aTitle.startsWith(queryLower);
      const bStartsWith = bTitle.startsWith(queryLower);

      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      const aIndex = aTitle.indexOf(queryLower);
      const bIndex = bTitle.indexOf(queryLower);

      if (aIndex !== bIndex) return aIndex - bIndex;
      return aTitle.localeCompare(bTitle);
    })
    .slice(0, limit);
};

/**
 * Uses the same cached `search/*` requests as the search results page (page 1),
 * so suggestions and results share CDN cache entries.
 */
export const getSearchSuggestions = async (
  query: string,
  limit: number = 10,
): ActionResponse<SearchSuggestion[] | null> => {
  if (isEmpty(query)) {
    return { success: true, message: "No search suggestions", data: null };
  }

  try {
    const [movies, tvShows] = await Promise.all([
      tmdb.search.movies({ query, page: 1 }),
      tmdb.search.tvShows({ query, page: 1 }),
    ]);

    const suggestions = buildSearchSuggestions(query, movies.results, tvShows.results, limit);

    if (isEmpty(suggestions)) {
      return { success: true, message: "No search suggestions", data: null };
    }

    return { success: true, message: "Search suggestions fetched", data: suggestions };
  } catch (error) {
    console.error("Search suggestions error:", error);
    return { success: false, message: "Error fetching search suggestions", data: null };
  }
};
