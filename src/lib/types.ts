// Shared type definitions

export type PostSource = "Zenn" | "note" | "Blog";

export type PostItem = {
  title: string;
  link: string;
  pubDate: string;
  source: PostSource;
  description?: string;
  tags?: string[];
};
