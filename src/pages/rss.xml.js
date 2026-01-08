import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';
import { SITE_OWNER } from '../lib/constants';

const parser = new MarkdownIt();

export async function GET(context) {
  const blog = await getCollection("blog");
  return rss({
    title: `${SITE_OWNER.name}'s Blog`,
    description: "my blog",
    site: context.site,
    items: blog.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      content: sanitizeHtml(parser.render(post.body)),
      link: `/blog/${post.slug}/`,
    })),
  });
}
