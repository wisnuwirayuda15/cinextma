"use client";

import Link from "next/link";
import { Saira } from "@/utils/fonts";
import { cn } from "@/utils/helpers";
import { Next } from "@/utils/icons";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";

export interface BrandLogoProps {
  animate?: boolean;
  className?: string;
}

const BrandLogo: React.FC<BrandLogoProps> = ({ animate = false, className }) => {
  const { content } = useDiscoverFilters();

  return (
    <Link href="/" className="group">
      <span
        className={cn(
          "flex items-center bg-gradient-to-r from-transparent from-80% via-white to-transparent bg-[length:200%_100%] bg-clip-text bg-[40%] text-2xl font-semibold text-foreground/60 md:text-3xl",
          "tracking-[0.1em] transition-[letter-spacing] group-hover:tracking-[0.2em]",
          {
            "animate-shine": animate,
            "text-foreground": !animate,
          },
          Saira.className,
          className,
        )}
      >
        CINE{" "}
        <span>
          <Next
            className={cn("size-full px-[2px] transition-colors", {
              "text-primary": content === "movie",
              "text-warning": content === "tv",
            })}
          />
        </span>{" "}
        TMA
      </span>
    </Link>
  );
};

export default BrandLogo;
