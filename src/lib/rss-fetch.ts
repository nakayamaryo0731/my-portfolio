// RSS fetcher using fast-xml-parser for reliable parsing
import { XMLParser } from "fast-xml-parser";
import type { FeedItem } from "./types";

interface RSSItem {
  title?: string;
  link?: string;
  pubDate?: string;
}

interface AtomEntry {
  title?: string;
  link?: string | { "@_href"?: string };
  published?: string;
  updated?: string;
}

interface ParsedRSS {
  rss?: {
    channel?: {
      item?: RSSItem | RSSItem[];
    };
  };
  feed?: {
    entry?: AtomEntry | AtomEntry[];
  };
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

export async function fetchRSSFeed(url: string): Promise<FeedItem[]> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      return [];
    }
    const xml = await response.text();
    return parseRSS(xml);
  } catch (e) {
    console.error(`Failed to fetch RSS from ${url}:`, e);
    return [];
  }
}

function parseRSS(xml: string): FeedItem[] {
  const parsed = parser.parse(xml) as ParsedRSS;
  const items: FeedItem[] = [];

  // RSS 2.0 format
  if (parsed.rss?.channel?.item) {
    const rssItems = Array.isArray(parsed.rss.channel.item)
      ? parsed.rss.channel.item
      : [parsed.rss.channel.item];

    for (const item of rssItems) {
      if (item.title && item.link) {
        items.push({
          title: item.title,
          link: item.link,
          pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
        });
      }
    }
  }

  // Atom format
  if (parsed.feed?.entry) {
    const entries = Array.isArray(parsed.feed.entry)
      ? parsed.feed.entry
      : [parsed.feed.entry];

    for (const entry of entries) {
      const link =
        typeof entry.link === "string"
          ? entry.link
          : entry.link?.["@_href"] ?? "";
      const dateStr = entry.published || entry.updated;

      if (entry.title && link) {
        items.push({
          title: entry.title,
          link,
          pubDate: dateStr ? new Date(dateStr) : new Date(),
        });
      }
    }
  }

  return items;
}
