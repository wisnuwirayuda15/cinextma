import { tmdb } from "@/api/tmdb-client";
import { ContentType } from "@/types";
import { cn } from "@/utils/helpers";
import { Select, SelectItem, SelectProps } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";

interface GenresSelectProps extends Omit<SelectProps, "children" | "selectionMode"> {
  type?: ContentType;
  onGenreChange?: (genres: Set<string> | null) => void;
}

const getQuery = (type: ContentType) => {
  return type === "movie" ? tmdb.genres.movies() : tmdb.genres.tvShows();
};

const GenresSelect: React.FC<GenresSelectProps> = ({
  type = "movie",
  onGenreChange,
  isLoading,
  ...props
}) => {
  const { data, isPending } = useQuery({
    queryFn: () => getQuery(type),
    queryKey: ["get-genre-select", type],
  });

  const GENRES = data?.genres || [];

  return (
    <Select
      {...props}
      size="sm"
      isLoading={isPending || isLoading}
      selectionMode="multiple"
      label={props.label ?? "Genres"}
      placeholder={props.placeholder ?? "Select genres"}
      className={cn("max-w-xs", props.className)}
      onChange={({ target }) =>
        onGenreChange?.(
          target.value === ""
            ? null
            : new Set(target.value.split(",").filter((genre) => genre !== "")),
        )
      }
    >
      {GENRES.map(({ id, name }) => {
        return <SelectItem key={id}>{name}</SelectItem>;
      })}
    </Select>
  );
};

export default GenresSelect;
