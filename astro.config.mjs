import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import cloudflare from "@astrojs/cloudflare";
import robotsTxt from "astro-robots-txt";
import UnoCSS from "@unocss/astro";
import icon from "astro-icon";

import solidJs from "@astrojs/solid-js";
import { remarkReadingTime } from "./src/lib/remark-reading-time.mjs";

import svelte from "@astrojs/svelte";

// https://astro.build/config
export default defineConfig({
  site: "https://rons-blog.com",
  integrations: [
    sitemap(),
    robotsTxt({
      sitemap: [
        "https://rons-blog.com/sitemap-index.xml",
        "https://rons-blog.com/sitemap-0.xml",
      ],
    }),
    solidJs(),
    UnoCSS({ injectReset: true }),
    icon(),
    svelte(),
  ],
  markdown: {
    remarkPlugins: [remarkReadingTime],
  },
  output: "server",
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
    sessions: {
      enabled: false,
    },
  }),
  vite: {
    assetsInclude: "**/*.riv",
  },
});
