import { tmdb } from "@/api/tmdb-client";
import Genres from "@/components/ui/other/Genres";
import { cn, isEmpty } from "@/utils/helpers";
import { Calendar, List, Play, Season } from "@/utils/icons";
import { getImageUrl, mutateTvShowTitle } from "@/utils/movies";
import { Button, Chip, Image, Link, Spinner } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import Rating from "../../../ui/other/Rating";
import { SavedMovieDetails } from "@/types/movie";
import BookmarkButton from "@/components/ui/button/BookmarkButton";

const TvShowHoverCard: React.FC<{ id: number; fullWidth?: boolean }> = ({ id, fullWidth }) => {
  const { data: tv, isPending } = useQuery({
    queryFn: () => tmdb.tvShows.details(id, ["images"]),
    queryKey: ["get-tv-detail-on-hover-poster", id],
  });

  if (isPending) {
    return (
      <div className="h-96 w-80">
        <Spinner size="lg" color="warning" variant="simple" className="absolute-center" />
      </div>
    );
  }

  if (!tv) return null;

  const title = mutateTvShowTitle(tv);
  const firstReleaseYear = new Date(tv.first_air_date).getFullYear();
  const lastReleaseYear = new Date(tv.last_air_date).getFullYear();
  const releaseYears = `${firstReleaseYear} ${firstReleaseYear !== lastReleaseYear ? ` - ${lastReleaseYear}` : ""}`;
  const fullTitle = title;
  const backdropImage = getImageUrl(tv.backdrop_path, "backdrop");
  const titleImage = getImageUrl(
    tv.images.logos.find((logo) => logo.iso_639_1 === "en")?.file_path,
    "title",
  );
  const bookmarkData: SavedMovieDetails = {
    type: "tv",
    adult: "adult" in tv ? (tv.adult as boolean) : false,
    backdrop_path: tv.backdrop_path,
    id: tv.id,
    poster_path: tv.poster_path,
    release_date: tv.first_air_date,
    title: fullTitle,
    vote_average: tv.vote_average,
    saved_date: new Date().toISOString(),
  };

  return (
    <div
      className={cn("w-80", {
        "w-full": fullWidth,
      })}
    >
      <div className="relative">
        <div className="absolute aspect-video h-fit w-full">
          <div className="absolute z-2 h-full w-full bg-linear-to-t from-secondary-background from-1%"></div>
          {!isEmpty(titleImage) && (
            <Image
              isBlurred
              radius="none"
              alt={fullTitle}
              classNames={{ wrapper: "absolute-center z-1 bg-transparent" }}
              className="h-full max-h-32 w-full drop-shadow-xl"
              src={titleImage}
            />
          )}
          <Image
            radius="none"
            alt={fullTitle}
            className="z-0 aspect-video rounded-t-lg object-cover object-center"
            src={backdropImage}
          />
        </div>
        <div className="flex flex-col gap-2 p-4 pt-[40%] *:z-10">
          <Chip
            color="warning"
            size="sm"
            variant="faded"
            className="md:text-md text-xs"
            classNames={{ content: "font-bold" }}
          >
            TV
          </Chip>
          <h4 className="text-xl font-bold">{fullTitle}</h4>
          <div className="md:text-md flex flex-wrap gap-1 text-xs md:gap-2">
            <div className="flex items-center gap-1">
              <Season />
              <span>
                {tv.number_of_seasons} Season{tv.number_of_seasons > 1 ? "s" : ""}
              </span>
            </div>
            <p>&#8226;</p>
            <div className="flex items-center gap-1">
              <List />
              <span>
                {tv.number_of_episodes} Episode{tv.number_of_episodes > 1 ? "s" : ""}
              </span>
            </div>
            <p>&#8226;</p>
            <div className="flex items-center gap-1">
              <Calendar />
              <span>{releaseYears}</span>
            </div>
            <p>&#8226;</p>
            <Rating rate={tv.vote_average} count={tv.vote_count} />
          </div>
          <Genres genres={tv.genres} type="tv" />
          <div className="flex w-full justify-between gap-2 py-1">
            <Button
              as={Link}
              href={`/tv/${tv.id}`}
              fullWidth
              color="warning"
              variant="shadow"
              startContent={<Play size={24} />}
            >
              View Episodes
            </Button>
            <BookmarkButton data={bookmarkData} isTooltipDisabled />
          </div>
          <p className="text-sm">{tv.overview}</p>
        </div>
      </div>
    </div>
  );
};

export default TvShowHoverCard;
