"use client";

import SectionTitle from "@/components/ui/other/SectionTitle";
import Carousel from "@/components/ui/wrapper/Carousel";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import ResumeCard from "./Cards/Resume";
import { useQuery } from "@tanstack/react-query";
import { getUserHistories } from "@/actions/histories";

const ContinueWatching: React.FC = () => {
  const { content } = useDiscoverFilters();
  const { data } = useQuery({
    queryFn: () => getUserHistories(),
    queryKey: ["continue-watching"],
    staleTime: 0, // history changes after every watch session
  });

  if (!data?.data) return null;

  return (
    <section id="continue-watching" className="min-h-[250px] md:min-h-[300px]">
      <div className="z-3 flex flex-col gap-2">
        <SectionTitle color={content === "movie" ? "primary" : "warning"}>
          Continue Your Journey
        </SectionTitle>
        <Carousel>
          {data.data.map((media) => {
            return (
              <div
                key={media.id}
                className="embla__slide flex min-h-fit max-w-fit items-center px-1 py-2"
              >
                <ResumeCard media={media} />
              </div>
            );
          })}
        </Carousel>
      </div>
    </section>
  );
};

export default ContinueWatching;
