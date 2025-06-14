import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const API_BASE_URL = "http://dtu.public.localhost:8000";

export const getAbsoluteImageUrl = (relativePath?: string): string => {
  if (relativePath && relativePath.startsWith("/")) {
    try {
      // Check if relativePath is already a full URL (e.g. from a previous incorrect save)
      new URL(relativePath);
      return relativePath; // It's already a full URL
    } catch (_) {
      // Not a full URL, proceed to prepend API_BASE_URL
      return `${API_BASE_URL}${relativePath}`;
    }
  }
  // Return a default placeholder or the original path if it's not a valid relative path starting with '/'
  // or if it's an empty string, null, or undefined.
  return relativePath && !relativePath.startsWith("/")
    ? relativePath
    : "/placeholder.svg";
};
