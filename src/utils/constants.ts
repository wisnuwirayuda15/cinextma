export const IS_BROWSER = typeof window !== "undefined";
export const IS_SERVER = !IS_BROWSER;
export const IS_PRODUCTION = process.env.NODE_ENV === "production";
export const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
export const IS_TEST = process.env.NODE_ENV === "test";

export const SpacingClasses = {
  main: "px-3 py-8 sm:px-5",
  reset: "-mx-3 -my-8 sm:-mx-5",
};
