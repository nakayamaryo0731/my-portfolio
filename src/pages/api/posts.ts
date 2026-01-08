import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { fetchRSSFeed } from "../../lib/rss-fetch";
import { RSS_FEEDS } from "../../lib/constants";
import type { PostItem } from "../../lib/types";

export const prerender = false;

export const GET: APIRoute = async () => {
  // Fetch all sources in parallel
  const [blogPosts, zennItems, noteItems] = await Promise.all([
    getCollection("blog", ({ data }) => !data.draft),
    fetchRSSFeed(RSS_FEEDS.zenn),
    fetchRSSFeed(RSS_FEEDS.note),
  ]);

  const posts: PostItem[] = [];

  // Internal blog posts
  blogPosts.forEach((post) => {
    posts.push({
      title: post.data.title,
      link: `/blog/${post.id}`,
      pubDate: post.data.pubDate.toISOString(),
      source: "Blog",
      description: post.data.description,
      tags: post.data.tags,
    });
  });

  // Zenn
  zennItems.forEach((item) => {
    posts.push({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate.toISOString(),
      source: "Zenn",
    });
  });

  // note
  noteItems.forEach((item) => {
    posts.push({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate.toISOString(),
      source: "note",
    });
  });

  // Sort by date
  posts.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  return new Response(JSON.stringify(posts), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300", // 5分キャッシュ
    },
  });
};
