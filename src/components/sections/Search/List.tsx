"use client";

import { tmdb } from "@/api/tmdb-client";
import { queryClient } from "@/app/providers";
import TvShowHomeCard from "@/components/sections/TV/Cards/Poster";
import BackToTopButton from "@/components/ui/button/BackToTopButton";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import { ContentType } from "@/types";
import { isEmpty } from "@/utils/helpers";
import { getLoadingLabel } from "@/utils/movies";
import { Spinner } from "@heroui/react";
import { useInViewport } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Movie, Search, TV } from "tmdb-ts/dist/types";
import MoviePosterCard from "../Movie/Cards/Poster";
import SearchFilter from "./Filter";

type FetchType = {
  page: number;
  type: ContentType;
  query: string;
};

const fetchData = async ({
  page,
  type = "movie",
  query,
}: FetchType): Promise<Search<Movie> | Search<TV>> => {
  if (type === "movie") return tmdb.search.movies({ query, page });
  return tmdb.search.tvShows({ query, page });
};

const SearchList = () => {
  const { content } = useDiscoverFilters();
  const { ref, inViewport } = useInViewport();
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState("");
  const triggered = !isEmpty(submittedSearchQuery);
  const { data, isFetching, isPending, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useInfiniteQuery({
      enabled: triggered,
      queryKey: ["search-list", content, submittedSearchQuery],
      queryFn: ({ pageParam: page }) =>
        fetchData({ page, type: content, query: submittedSearchQuery }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    });

  useEffect(() => {
    if (inViewport) {
      fetchNextPage();
    }
  }, [inViewport]);

  useEffect(() => {
    queryClient.removeQueries({ queryKey: ["search-list"] });
  }, [content]);

  const renderSearchResults = useMemo(() => {
    return () => {
      if (isEmpty(data?.pages[0].results)) {
        return (
          <h5 className="mt-56 text-center text-xl">
            No {content === "movie" ? "movies" : "TV series"} found with query{" "}
            <span className="text-warning font-semibold">"{submittedSearchQuery}"</span>
          </h5>
        );
      }

      return (
        <>
          <h5 className="text-center text-xl">
            <span className="motion-preset-focus">
              Found{" "}
              <span className="text-success font-semibold">{data?.pages[0].total_results}</span>{" "}
              {content === "movie" ? "movies" : "TV series"} with query{" "}
              <span className="text-warning font-semibold">"{submittedSearchQuery}"</span>
            </span>
          </h5>
          <div className="movie-grid">
            {content === "movie"
              ? data?.pages.map((page) =>
                  page.results.map((movie) => (
                    <MoviePosterCard key={movie.id} movie={movie as Movie} variant="bordered" />
                  )),
                )
              : data?.pages.map((page) =>
                  page.results.map((tv) => (
                    <TvShowHomeCard key={tv.id} tv={tv as TV} variant="bordered" />
                  )),
                )}
          </div>
        </>
      );
    };
  }, [content, data?.pages, submittedSearchQuery]);

  return (
    <div className="flex flex-col items-center gap-8">
      <SearchFilter
        isLoading={isFetching}
        onSearchSubmit={(value) => setSubmittedSearchQuery(value.trim())}
      />
      {triggered && (
        <>
          <div className="relative flex flex-col items-center gap-8">
            {isPending ? (
              <Spinner
                size="lg"
                className="absolute-center mt-56"
                color={content === "movie" ? "primary" : "warning"}
                variant="simple"
              />
            ) : (
              renderSearchResults()
            )}
          </div>
          <div ref={ref} className="flex h-24 items-center justify-center">
            {isFetchingNextPage && (
              <Spinner
                color={content === "movie" ? "primary" : "warning"}
                size="lg"
                variant="wave"
                label={getLoadingLabel()}
              />
            )}
            {!isEmpty(data?.pages[0].results) && !hasNextPage && !isPending && (
              <p className="text-muted-foreground text-center text-base">
                You have reached the end of the list.
              </p>
            )}
          </div>
        </>
      )}

      <BackToTopButton />
    </div>
  );
};

export default SearchList;
