import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * A utility function to merge Tailwind CSS classes using `clsx` and `tailwind-merge`.
 * This function accepts any number of `ClassValue` inputs and returns a single merged class string.
 *
 * @param inputs - Any number of `ClassValue` inputs representing Tailwind CSS classes.
 * @returns A single merged class string that can be used in JSX elements.
 *
 * @example cn('font-bold', 'text-center')
 */
export const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(inputs));
};

/**
 * Checks if a variable is empty
 * - `null` and `undefined` are considered empty
 * - Empty strings, arrays, maps, sets, and objects are considered empty
 * - The number 0 is not considered empty
 * - Boolean false is not considered empty
 *
 * @param value - The value to check
 * @returns True if the value is considered empty, false otherwise
 */
export const isEmpty = <T>(value: T): boolean => {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === "string") {
    return value.trim().length === 0;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (value instanceof Map || value instanceof Set) {
    return value.size === 0;
  }
  if (value !== null && typeof value === "object") {
    return Object.keys(value).length === 0;
  }
  return false;
};

/**
 * Formats a number to a human-readable string with abbreviations for large numbers.
 * For example, 1000 becomes 1k, 1000000 becomes 1m, etc.
 *
 * @param num - The number to format
 * @param options - Optional configuration for the formatting
 * @returns The formatted number as a string
 */
export function formatNumber(
  num: number,
  options: {
    decimals?: number;
    forceDecimals?: boolean;
    uppercase?: boolean;
  } = {},
): string {
  const { decimals = 1, forceDecimals = false, uppercase = false } = options;

  const isNegative = num < 0;
  const absNum = Math.abs(num);

  const abbreviations: { threshold: number; suffix: string }[] = [
    { threshold: 1e12, suffix: "t" },
    { threshold: 1e9, suffix: "b" },
    { threshold: 1e6, suffix: "m" },
    { threshold: 1e3, suffix: "k" },
  ];

  for (const { threshold, suffix } of abbreviations) {
    if (absNum >= threshold) {
      const abbreviated = absNum / threshold;

      let result: string;
      if (forceDecimals || abbreviated % 1 !== 0) {
        result = abbreviated.toFixed(decimals);
        if (!forceDecimals) {
          result = result.replace(/\.?0+$/, "");
        }
      } else {
        result = abbreviated.toFixed(0);
      }

      const formattedSuffix = uppercase ? suffix.toUpperCase() : suffix;
      return (isNegative ? "-" : "") + result + formattedSuffix;
    }
  }

  return num.toString();
}

/**
 * Formats a date string or Date object into a human-readable string.
 *
 * @param date - The date to format
 * @param locale - The locale to use for formatting
 * @param options - The formatting options
 * @returns The formatted date as a string
 */
export const formatDate = (
  date: string | Date,
  locale: string = "id-ID",
  options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" },
): string => {
  if (!date) return "";

  const parsedDate = typeof date === "string" ? new Date(date) : date;

  if (isNaN(parsedDate.getTime())) {
    throw new Error("Invalid date input");
  }

  return new Intl.DateTimeFormat(locale, options).format(parsedDate);
};

/**
 * Shuffles the elements of an array in place.
 *
 * @param array - The array to shuffle
 * @returns The shuffled array
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }

  return shuffled;
};
