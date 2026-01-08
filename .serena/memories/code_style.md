# Code Style & Conventions

## TypeScript
- Strict mode enabled (`astro/tsconfigs/strict`)
- JSX: preserve, jsxImportSource: solid-js
- 型定義は `src/lib/types.ts` に集約

## ESLint Rules
- `no-unused-vars`: warn
- `no-undef`: error
- `no-console`: warn
- `no-debugger`: error
- Astro specific rules enabled

## File Naming
- Components: PascalCase (.astro, .tsx)
- Utilities/helpers: camelCase (.ts, .mjs)
- Pages: lowercase with hyphens or [dynamic].astro

## Component Patterns
- Astroコンポーネント: `.astro` (静的/SSR)
- Solid.jsコンポーネント: `.tsx` (インタラクティブ)
- Svelteコンポーネント: `.svelte` (インタラクティブ)

## Styling
- UnoCSS (Tailwind互換のユーティリティクラス)
- インラインスタイルまたは `<style>` タグ

## Japanese Comments
- コミットメッセージは日本語で記述されている
- コメントも日本語が使用されることがある
