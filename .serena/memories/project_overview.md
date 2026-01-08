# Project Overview: my-portfolio (astro-bento-portfolio)

## Purpose
個人ポートフォリオサイト / ブログサイト。Bento UIスタイルのカード型レイアウトを採用。

## Tech Stack
- **Framework**: Astro 5.x (SSR mode)
- **Hosting**: Cloudflare Pages
- **UI Frameworks**: Solid.js, Svelte
- **Styling**: UnoCSS (with PostCSS, autoprefixer)
- **Icons**: astro-icon, @iconify-json/ri
- **Animations**: GSAP, Motion, Rive, Lenis (smooth scroll)
- **Data Visualization**: D3.js (Globe component)
- **Image Processing**: Sharp
- **Package Manager**: pnpm

## Main Features
- ブログ投稿システム (Markdown with reading-time)
- プロジェクト紹介
- 書籍紹介
- 趣味紹介
- 旅行/訪問国表示 (3D Globe)
- RSS フィード
- サイトマップ自動生成

## Directory Structure
```
src/
├── components/     # UIコンポーネント (.astro, .tsx)
│   ├── Card/       # カード関連
│   ├── Blog/       # ブログ関連
│   ├── Tooltip/    # ツールチップ
│   └── playground/ # 実験的コンポーネント
├── data/           # コンテンツデータ
│   ├── blog/       # ブログ記事
│   ├── projects/   # プロジェクト
│   └── books/      # 書籍
├── layouts/        # ページレイアウト
├── lib/            # ユーティリティ、型定義
├── pages/          # ルーティング（ファイルベース）
└── riveAnimations/ # Riveアニメーションファイル
```

## Configuration Files
- `astro.config.mjs` - Astro設定
- `uno.config.ts` - UnoCSS設定
- `tsconfig.json` - TypeScript設定 (strict mode)
- `eslint.config.js` - ESLint設定
- `wrangler.toml` - Cloudflare設定
