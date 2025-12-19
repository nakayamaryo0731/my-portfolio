import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { rssSchema } from "@astrojs/rss";

const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/data/blog" }),
  schema: rssSchema,
});

const books = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/data/books" }),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    rating: z.number().min(1).max(5).optional(),
    finished: z.coerce.date().optional(),
  }),
});

export const collections = { blog, books };
