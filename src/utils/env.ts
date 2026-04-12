import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    PROTECTED_PATHS: z.string(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_TMDB_ACCESS_TOKEN: z.string().min(1),
    NEXT_PUBLIC_SUPABASE_URL: z.url().min(1),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
    NEXT_PUBLIC_CAPTCHA_SITE_KEY: z.string().optional().or(z.literal("")),
    NEXT_PUBLIC_AVATAR_PROVIDER_URL: z.string().url().optional().or(z.literal("")),
    NEXT_PUBLIC_MEDIAFLOW_URL: z.string().url().optional().or(z.literal("")),
    NEXT_PUBLIC_MEDIAFLOW_PASSWORD: z.string().optional(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_TMDB_ACCESS_TOKEN: process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY,
    NEXT_PUBLIC_AVATAR_PROVIDER_URL: process.env.NEXT_PUBLIC_AVATAR_PROVIDER_URL,
    NEXT_PUBLIC_MEDIAFLOW_URL: process.env.NEXT_PUBLIC_MEDIAFLOW_URL,
    NEXT_PUBLIC_MEDIAFLOW_PASSWORD: process.env.NEXT_PUBLIC_MEDIAFLOW_PASSWORD,
  },
});
