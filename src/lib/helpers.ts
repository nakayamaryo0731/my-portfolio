import type { PostSource } from "./types";
import { SOURCE_STYLES } from "./constants";

export function trimText(input: string, maxLength: number = 100): string {
  if (input.length <= maxLength) return input;
  return input.substring(0, maxLength - 3) + "...";
}

/** Returns the appropriate link target for a post source */
export function getPostTarget(source: PostSource): "_self" | "_blank" {
  return source === "Blog" ? "_self" : "_blank";
}

/** Generates HTML for a source badge */
export function renderSourceBadge(source: PostSource): string {
  return `<span class="text-xs px-1.5 py-0.5 rounded ${SOURCE_STYLES[source]}">${source}</span>`;
}

export function formatTimeForJapan(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Tokyo",
  };

  let formattedTime = new Intl.DateTimeFormat("ja-JP", options).format(date);
  formattedTime += " JST";

  return formattedTime;
}

// English format (e.g., "January 1, 2025")
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Japanese format (e.g., "2025年1月1日")
export function formatDateJP(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
