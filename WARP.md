# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Tooling & Commands

- **Install dependencies (preferred):** `pnpm install`
- **Alternative install:** `npm install`
- **Start dev server:** `pnpm run dev` (or `npm run dev`) – starts Astro’s dev server.
- **Build for production:** `pnpm run build` – runs `astro build`.
- **Preview production build locally:** `pnpm run preview` – serves the built site.
- **Astro CLI passthrough:** `pnpm run astro -- <subcommand>` (e.g. `pnpm run astro -- sync`).
- **Type & content check:** `pnpm run check` – runs `astro check` (type-checking and content validation).
- **Lint Astro/JS files:** `pnpm run eslint` – uses ESLint with `eslint-plugin-astro` over `src/**/*.{js,astro}`.

**Tests:** There is currently no test script configured in `package.json` and no test runner set up, so there is no standard way to run a test suite or a single test.

## High-Level Architecture

### Framework, runtime, and hosting

- The site is built with **Astro 5** (`astro` dependency) and uses:
  - **Cloudflare adapter** (`@astrojs/cloudflare`) with `output: "server"` and `platformProxy.enabled = true` in `astro.config.mjs`. This is optimized for Cloudflare Workers/Pages-style deployment.
  - Integrations: `@astrojs/sitemap`, `astro-robots-txt`, `@astrojs/solid-js`, `@astrojs/svelte`, `astro-icon`, and UnoCSS via `@unocss/astro`.
- The canonical site URL and sitemap configuration live in `astro.config.mjs` (`site` field and `sitemap`/`robotsTxt` integrations). Update these when changing the production domain.

### Routing and page structure (`src/pages`)

- Astro’s file-based routing is used:
  - **Home page:** `src/pages/index.astro`
    - Uses the `Layout.astro` layout to wrap a bento-style grid of cards (intro, about, contacts, time zone, books, posts, footer).
    - Imports motion (`motion` library) to animate the loader and card entrance sequences on the client.
  - **Aggregated posts index:** `src/pages/posts.astro`
    - Builds a unified list of posts from:
      - Internal blog content (content collection `blog`).
      - External RSS feeds (`https://zenn.dev/r0nr0n/feed` and `https://note.com/ron0731/rss`) via `fetchRSSFeed` from `src/lib/rss-fetch.ts`.
    - Normalizes posts into a common shape (`title`, `link`, `pubDate`, `source`) and sorts them by date.
  - **Blog:**
    - `src/pages/blog/index.astro` lists all internal blog posts (from the `blog` content collection), sorted by `pubDate`, with tag filters.
    - `src/pages/blog/[id].astro` renders individual blog posts using `getStaticPaths` + `astro:content.render`, and uses `BasicLayout.astro` directly.
    - `src/pages/blog/tags/[tag].astro` provides a tag-filtered view of blog posts. `getStaticPaths` precomputes all tag routes.
  - **Books:**
    - `src/pages/books/index.astro` lists all “book” entries (from the `books` content collection), sorted by optional `finished` date, with star ratings rendered as ★/☆.
    - `src/pages/books/[id].astro` renders a single book page from markdown content.
  - **Travel:**
    - `src/pages/travel.astro` shows a rotating 3D globe of visited countries using a SolidJS-powered `Globe` island and a simple loader animation. Uses `BasicLayout` with `page="travel"` to alter metadata.
  - **RSS feed:**
    - `src/pages/rss.xml.js` defines a server-side `GET` handler that uses `@astrojs/rss` to generate an RSS feed from the `blog` collection. It converts markdown bodies to HTML with `markdown-it` and sanitizes with `sanitize-html`.

### Layouts, metadata, and SEO (`src/layouts`)

- **`BasicLayout.astro`** is the primary HTML shell for all pages:
  - Renders `<html>`, `<head>`, and `<body>` for every page.
  - Handles:
    - `<title>` and `<meta name="description">` based on props.
    - Open Graph and Twitter card tags using the `image` derived from `Astro.url.origin` and the `page` prop.
    - `rel="canonical"` pointing to `Astro.url.href`.
    - JSON-LD **schema.org** metadata:
      - For non-blog pages (`page !== "blog"`), renders a `Person` schema describing the site owner (currently still using the original template’s values like the name `Gianmarco`).
      - For blog-related pages (`page === "blog"`), renders a `BlogPosting` schema (headline, description, dates, publisher, etc.).
  - Uses `LINKS` from `src/lib/constants.ts` for social URLs inside the schema.
  - Defines global font faces (`CabinetGrotesk`, `Satoshi`) and basic typography/body styles in a global `<style is:global>` block.

- **`Layout.astro`** wraps content with `BasicLayout` and injects a full-screen **loader overlay** via the `slot="loader"`. The home page uses this in combination with Motion’s `loaderAnimation` sequence defined in `src/lib/constants.ts`.

- **`LayoutBlogPost.astro`** is an additional blog layout that provides a full-screen article view and uses `formatDate` from `src/lib/helpers.ts`. It is currently not wired to `blog/[id].astro`, which instead uses `BasicLayout` directly; treat `LayoutBlogPost` as an alternative/legacy layout.

### Content model (`src/content.config.ts` and `src/data`)

- Astro **content collections** are defined in `src/content.config.ts` using `defineCollection` and `zod` schemas:
  - `blog` collection:
    - Loader: markdown files in `./src/data/blog` (`**/[^_]*.md`).
    - Schema: `title`, optional `description`, `pubDate` (coerced to `Date`), optional `category`, optional `tags[]`, optional `draft` flag (defaults to `false`).
    - Used by blog pages and cards, and the site RSS feed.
  - `books` collection:
    - Loader: markdown files in `./src/data/books`.
    - Schema: `title`, `author`, `rating` (1–5, optional), `finished` date (optional).
    - Backed by markdown files for each book, rendered by the books pages.

- Actual markdown content lives under:
  - `src/data/blog` – blog posts.
  - `src/data/books` – book notes/reviews.

### Styling and design system (UnoCSS & global styles)

- Styling is primarily via **UnoCSS** with a Tailwind-like utility API:
  - `uno.config.ts` defines:
    - The content scan paths (`src/**/*.{html,js,ts,jsx,tsx,vue,svelte,astro}`) so UnoCSS can tree-shake classes.
    - A custom theme: `colors.darkslate`, `colors.primary`, `gray` shades, custom `boxShadow`, and grid templates (`gridTemplateRows`, `gridTemplateColumns`).
    - Presets:
      - `presetWind3()` for Tailwind-compatible utilities.
      - `presetTypography()` with extended colors for headings, paragraphs, list items, strong text, and blockquotes (tuned for dark mode prose rendering).
      - `presetWebFonts()` with the `fontshare` provider to bring in `Cabinet Grotesk`, `Satoshi`, and `Zodiak`.
- Additional global styles (font-face declarations, body typography, heading fonts) live in `BasicLayout.astro`.
- Components and pages use utility classes heavily (e.g. `bg-darkslate-700`, `text-primary-400`, `grid`, `flex`, `prose prose-invert`). When adding UI, prefer continuing this pattern.

### Interactive islands (SolidJS and Svelte)

- **SolidJS** is configured as the JSX runtime:
  - `tsconfig.json` sets `"jsx": "preserve"` and `"jsxImportSource": "solid-js"`.
  - `jsx.d.ts` customizes the global `JSX.Element` to `HTMLElement` to satisfy both Solid and Astro.

- Key Solid components:
  - `src/components/Globe.tsx`:
    - Uses `onMount` and D3 (`d3` package) to render a rotating orthographic globe using `world.json` from `src/lib/world.json`.
    - Highlights a hard-coded list of visited countries in a different color.
  - `src/components/Tooltip/index.tsx`:
    - Wraps children in a trigger that toggles a tooltip on mouse/touch events.
    - Maintains a `clickCount` and cycles through a list of predefined messages.
  - `src/components/playground/rifle-1.tsx`:
    - Integrates a Rive animation (`@rive-app/canvas`) from `src/riveAnimations/rifle.riv`.
    - Manages canvas resize to keep aspect ratio responsive and wires up a `keep_shooting` state machine input toggled via a checkbox.

- **Svelte** is used for experimental/visual playground content:
  - `src/components/playground/scroll-1/scroll-1.svelte` and its `svg-shapes` children define scroll-based animations using `gsap`, `ScrollTrigger`, and `Lenis` for smooth scrolling and parallax column effects.

- These islands are mounted into Astro pages via `client:*` hydration directives (e.g. `client:load` on `Globe` in `travel.astro`). New interactive functionality should generally follow the same pattern: small Solid/Svelte components mounted into Astro pages.

### Shared utilities and constants (`src/lib`)

- `src/lib/constants.ts`:
  - `LINKS` object centralizes social/contact links (GitHub, LinkedIn, X, email) used in layouts and cards.
  - `loaderAnimation` defines the Motion animation sequence for fading out the loader overlay (used by the home page).

- `src/lib/helpers.ts`:
  - Text utilities: `trimText` for truncating strings with `...`.
  - Time utilities:
    - `getCurrentTimeInJapan` (currently just `new Date()`; time zone is applied in formatting).
    - `formatTimeForJapan` (formats a `Date` into `HH:MM:SS JST` using `Asia/Tokyo`).
    - `formatDate` for `en-US` “Month Day, Year” formatting (used across blog and lists).

- `src/lib/rss-fetch.ts`:
  - Provides `fetchRSSFeed(url)` that:
    - Uses `fetch` to retrieve XML.
    - Parses RSS 2.0 and Atom feeds via regex to extract `<title>`, `<link>` (including Atom-style `link href="..."`), and date fields (`<pubDate>`, `<published>`, `<updated>`).
    - Normalizes into `FeedItem { title, link, pubDate }`.
    - Handles Cloudflare Worker compatibility by avoiding DOMParser and using only string/regex operations.

### Cards and home layout components (`src/components`)

- The home page’s bento-like layout is built from reusable card components:
  - `Card/index.astro` and `Card/Content.astro` (not fully detailed here) provide the structural grid card container used throughout.
  - `IntroCard.astro`, `AboutMe.astro`, `ContactsCard.astro`, `TimeZoneCard.astro`, `MyStack.astro`, `Now.astro`, and `Pulse.astro` render specific sections of the home view.
  - `BooksCard.astro` and `PostsCard.astro` bridge the content collections/RSS feeds into card UIs on the home page by querying `astro:content` and `fetchRSSFeed`.
  - `Blog/PostRow.astro` provides a reusable row layout for blog lists using `formatDate`.

## Template origins and customization notes

- This project is based on the public **`astro-bento-portfolio`** template (see `README.md`), and some metadata still reflects the original author (e.g. the `Person` and `BlogPosting` schema fields in `BasicLayout.astro`).
- When adapting the site further, prefer updating:
  - `astro.config.mjs` (`site`, `sitemap`, `robotsTxt` settings).
  - `src/lib/constants.ts` (`LINKS`).
  - `src/layouts/BasicLayout.astro` (schema.org metadata and social links embedded in JSON-LD).
  - Markdown content in `src/data/blog` and `src/data/books`.

Keeping these areas in sync will ensure future changes to content or branding reflect consistently across pages, metadata, and feeds.
