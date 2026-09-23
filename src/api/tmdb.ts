import "server-only";
import { env } from "@/utils/env";
import { isEmpty } from "@/utils/helpers";
import { TMDB } from "tmdb-ts";

const token = env.TMDB_ACCESS_TOKEN;

if (isEmpty(token)) {
  throw new Error("TMDB_ACCESS_TOKEN is not defined");
}

export const tmdb = new TMDB(token);
