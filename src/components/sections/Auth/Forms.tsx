"use client";

import { tmdb } from "@/api/tmdb";
import ThreeDMarquee from "@/components/ui/background/ThreeDMarquee";
import IconButton from "@/components/ui/button/IconButton";
import Brand from "@/components/ui/other/BrandLogo";
import { SpacingClasses } from "@/utils/constants";
import { cn, isEmpty, shuffleArray } from "@/utils/helpers";
import { ArrowLeft } from "@/utils/icons";
import { getImageUrl } from "@/utils/movies";
import { Card, CardBody, CardHeader, ScrollShadow, Spinner } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useMemo } from "react";
import AuthForgotPasswordForm from "./ForgotPassword";
import AuthLoginForm from "./Login";
import AuthRegisterForm from "./Register";
import AuthResetPasswordForm from "./ResetPassword";

const ValidForms = ["login", "register", "forgot", "reset"] as const;

export interface AuthFormProps {
  setForm: (form: (typeof ValidForms)[number]) => void;
}

const AuthForms = () => {
  const [form, setForm] = useQueryState(
    "form",
    parseAsStringLiteral(ValidForms).withDefault("login"),
  );

  const { data: movies, isPending: isPendingMovies } = useQuery({
    queryFn: () => tmdb.trending.trending("movie", "day"),
    queryKey: ["movie-auth-posters"],
  });

  const { data: tvShows, isPending: isPendingTv } = useQuery({
    queryFn: () => tmdb.trending.trending("tv", "day"),
    queryKey: ["tv-auth-posters"],
  });

  const IMAGES = useMemo(() => {
    if (!movies?.results || !tvShows?.results) return [];
    const moviePosters = movies.results
      .filter((movie) => movie.poster_path)
      .map((movie) => getImageUrl(movie.poster_path, "poster"));
    const tvPosters = tvShows.results
      .filter((show) => show.poster_path)
      .map((show) => getImageUrl(show.poster_path, "poster"));
    return shuffleArray([...moviePosters, ...tvPosters]);
  }, [movies?.results, tvShows?.results]);

  if (isPendingMovies || isPendingTv) {
    return <Spinner size="lg" className="absolute-center" variant="simple" />;
  }

  return (
    <div
      className={cn(
        "relative z-50 flex h-screen w-screen flex-col items-center justify-center overflow-hidden",
        "before:pointer-events-none before:absolute before:inset-0 before:z-20 before:opacity-40 dark:before:opacity-70",
        "dark:before:bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)]",
        "before:bg-[radial-gradient(circle_at_center,transparent_0%,white_100%)]",
        SpacingClasses.reset,
      )}
    >
      <div className="container pointer-events-none relative z-50 mx-auto flex size-full flex-col items-center justify-center p-3">
        <Card
          shadow="lg"
          className="pointer-events-auto w-full max-w-lg border-2 border-foreground-200 bg-background/70 p-1 backdrop-blur-md dark:bg-background/80 md:p-3"
        >
          <CardHeader className="relative flex items-center justify-center">
            {form === "forgot" && (
              <IconButton
                size="md"
                variant="light"
                onClick={() => setForm("login")}
                className="group motion-preset-focus absolute left-2 data-[hover=true]:bg-transparent"
                icon={<ArrowLeft className="text-4xl transition-transform group-hover:scale-125" />}
              />
            )}
            <Brand className="text-3xl md:text-4xl" animate />
          </CardHeader>
          <ScrollShadow hideScrollBar visibility="none">
            <AnimatePresence mode="sync">
              <motion.div
                key={form}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
              >
                <CardBody>
                  {form === "login" && <AuthLoginForm setForm={setForm} />}
                  {form === "register" && <AuthRegisterForm setForm={setForm} />}
                  {form === "forgot" && <AuthForgotPasswordForm setForm={setForm} />}
                  {form === "reset" && <AuthResetPasswordForm setForm={setForm} />}
                </CardBody>
              </motion.div>
            </AnimatePresence>
          </ScrollShadow>
        </Card>
      </div>
      <div className="pointer-events-none absolute inset-0 z-10 h-full w-full bg-black/60 backdrop-blur-[2px] dark:bg-black/20" />
      {!isEmpty(IMAGES) && <ThreeDMarquee className="absolute" images={IMAGES} aspect="poster" />}
    </div>
  );
};

export default AuthForms;
