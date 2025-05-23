"use client";

import { tmdb } from "@/api/tmdb";
import { DiscoverMoviesFetchQueryType } from "@/types/movie";
import { useQuery } from "@tanstack/react-query";
import { kebabCase } from "string-ts";

interface FetchDiscoverMovies {
  page?: number;
  type?: DiscoverMoviesFetchQueryType;
  genres?: string;
}

/**
 * Fetches the list of movies from the specified discover type.
 *
 * @param {Object} [options] - Options for the fetch.
 * @param {number} [options.page=1] - Page number to fetch.
 * @param {DiscoverMoviesFetchQueryType} [options.type="discover"] - Type of discover query to fetch.
 *
 * @returns {QueryResult<Movie[], Error>} - The result of the query, which is a list of movies.
 */
const useFetchDiscoverMovies = ({ page = 1, type = "discover", genres }: FetchDiscoverMovies) => {
  const discover = tmdb.discover.movie({ page: page, with_genres: genres });
  const todayTrending = tmdb.trending.trending("movie", "day", { page: page });
  const thisWeekTrending = tmdb.trending.trending("movie", "week", { page: page });
  const popular = tmdb.movies.popular({ page: page });
  const nowPlaying = tmdb.movies.nowPlaying({ page: page });
  const upcoming = tmdb.movies.upcoming({ page: page });
  const topRated = tmdb.movies.topRated({ page: page });

  const queryData = {
    discover,
    todayTrending,
    thisWeekTrending,
    popular,
    nowPlaying,
    upcoming,
    topRated,
  }[type];

  return useQuery({
    queryFn: () => queryData,
    queryKey: [kebabCase(type) + "-movies", page, genres],
  });
};

export default useFetchDiscoverMovies;
