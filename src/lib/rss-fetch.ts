// Native RSS fetcher for Cloudflare Workers compatibility
export type FeedItem = {
  title: string;
  link: string;
  pubDate: Date;
};

export async function fetchRSSFeed(url: string): Promise<FeedItem[]> {
  try {
    const response = await fetch(url);
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
  const items: FeedItem[] = [];

  // Match <item> or <entry> elements (RSS 2.0 and Atom)
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>|<entry[^>]*>([\s\S]*?)<\/entry>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemContent = match[1] || match[2];

    // Extract title
    const titleMatch = itemContent.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    const title = titleMatch ? decodeHTMLEntities(titleMatch[1].trim()) : "";

    // Extract link (RSS 2.0 style or Atom style)
    let link = "";
    const linkMatch = itemContent.match(/<link[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
    if (linkMatch) {
      link = linkMatch[1].trim();
    } else {
      // Atom style: <link href="..." />
      const atomLinkMatch = itemContent.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i);
      if (atomLinkMatch) {
        link = atomLinkMatch[1];
      }
    }

    // Extract pubDate or published
    const dateMatch = itemContent.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>|<published[^>]*>([\s\S]*?)<\/published>|<updated[^>]*>([\s\S]*?)<\/updated>/i);
    const dateStr = dateMatch ? (dateMatch[1] || dateMatch[2] || dateMatch[3]).trim() : "";
    const pubDate = dateStr ? new Date(dateStr) : new Date();

    if (title && link) {
      items.push({ title, link, pubDate });
    }
  }

  return items;
}

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}
