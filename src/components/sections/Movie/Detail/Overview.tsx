"use client";

import { Image, Chip, Button } from "@heroui/react";
import { getImageUrl, movieDurationString, mutateMovieTitle } from "@/utils/movies";
import BookmarkButton from "@/components/ui/button/BookmarkButton";
import { MovieDetails } from "tmdb-ts/dist/types/movies";
import Rating from "../../../ui/other/Rating";
import ShareButton from "@/components/ui/button/ShareButton";
import { AppendToResponse } from "tmdb-ts/dist/types/options";
import { useDocumentTitle } from "@mantine/hooks";
import { siteConfig } from "@/config/site";
import { FaCirclePlay } from "react-icons/fa6";
import Genres from "@/components/ui/other/Genres";
import SectionTitle from "@/components/ui/other/SectionTitle";
import Trailer from "@/components/ui/overlay/Trailer";
import { Calendar, Clock } from "@/utils/icons";
import Link from "next/link";
import { SavedMovieDetails } from "@/types/movie";

interface OverviewSectionProps {
  movie: AppendToResponse<MovieDetails, "videos"[], "movie">;
}

const OverviewSection: React.FC<OverviewSectionProps> = ({ movie }) => {
  const releaseYear = new Date(movie.release_date).getFullYear();
  const posterImage = getImageUrl(movie.poster_path);
  const title = mutateMovieTitle(movie);
  const fullTitle = title;
  const bookmarkData: SavedMovieDetails = {
    type: "movie",
    adult: movie.adult,
    backdrop_path: movie.backdrop_path,
    id: movie.id,
    poster_path: movie.poster_path,
    release_date: movie.release_date,
    title: fullTitle,
    vote_average: movie.vote_average,
    saved_date: new Date().toISOString(),
  };

  useDocumentTitle(`${fullTitle} | ${siteConfig.name}`);

  return (
    <section id="overview" className="relative z-3 flex flex-col gap-8 pt-[20vh] md:pt-[40vh]">
      <div className="md:grid md:grid-cols-[auto_1fr] md:gap-6">
        <Image
          isBlurred
          shadow="md"
          alt={fullTitle}
          classNames={{
            wrapper: "w-52 max-h-min aspect-2/3 hidden md:block",
          }}
          className="object-cover object-center"
          src={posterImage}
        />

        <div className="flex flex-col gap-8">
          <div id="title" className="flex flex-col gap-1 md:gap-2">
            <div className="flex gap-3">
              <Chip
                color="primary"
                variant="faded"
                className="md:text-md text-xs"
                classNames={{ content: "font-bold" }}
              >
                Movie
              </Chip>
              {movie.adult && (
                <Chip color="danger" variant="faded">
                  18+
                </Chip>
              )}
            </div>
            <h2 className="text-2xl font-black md:text-4xl">{fullTitle}</h2>
            <div className="md:text-md flex flex-wrap gap-1 text-xs md:gap-2">
              <div className="flex items-center gap-1">
                <Clock />
                <span>{movieDurationString(movie?.runtime)}</span>
              </div>
              <p>&#8226;</p>
              <div className="flex items-center gap-1">
                <Calendar />
                <span>{releaseYear}</span>
              </div>
              <p>&#8226;</p>
              <Rating rate={movie?.vote_average || 0} />
            </div>
            <Genres genres={movie.genres} />
          </div>

          <div id="action" className="flex w-full flex-wrap justify-between gap-4 md:gap-0">
            <div className="flex flex-wrap gap-2">
              <Button
                as={Link}
                href={`/movie/${movie.id}/player`}
                prefetch={false}
                color="primary"
                variant="shadow"
                startContent={<FaCirclePlay size={22} />}
              >
                Play Now
              </Button>
              <Trailer videos={movie.videos.results} />
            </div>
            <div className="flex flex-wrap gap-2">
              <ShareButton id={movie.id} title={title} />
              <BookmarkButton data={bookmarkData} />
            </div>
          </div>

          <div id="story" className="flex flex-col gap-2">
            <SectionTitle>Story Line</SectionTitle>
            <p className="text-sm">{movie.overview}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OverviewSection;
