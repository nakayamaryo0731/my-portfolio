import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { fetchRSSFeed } from "../../lib/rss-fetch";

export const prerender = false;

type PostItem = {
  title: string;
  link: string;
  pubDate: string;
  source: "Zenn" | "note" | "Blog";
  description?: string;
  tags?: string[];
};

export const GET: APIRoute = async () => {
  const posts: PostItem[] = [];

  // Internal blog posts
  const blogPosts = await getCollection("blog", ({ data }) => !data.draft);
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
  const zennItems = await fetchRSSFeed("https://zenn.dev/r0nr0n/feed");
  zennItems.forEach((item) => {
    posts.push({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate.toISOString(),
      source: "Zenn",
    });
  });

  // note
  const noteItems = await fetchRSSFeed("https://note.com/ron0731/rss");
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
