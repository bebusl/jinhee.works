import fs from "fs";
import path from "path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "posts");

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  updated_at?: string;
  category?: string;
  featured?: boolean;
  notion_id?: string;
}

export function getPostsMetadata(): PostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return [];

  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));

  const posts: PostMeta[] = files.map((file) => {
    const slug = file.replace(/\.(md|mdx)$/, "");
    const filePath = path.join(POSTS_DIR, file);
    const { data } = matter(fs.readFileSync(filePath, "utf-8"));

    return {
      slug,
      title: String(data.title ?? slug),
      date: String(data.date ?? "").slice(0, 10),
      ...(data.updated_at ? { updated_at: String(data.updated_at).slice(0, 10) } : {}),
      ...(data.category ? { category: String(data.category) } : {}),
      ...(data.featured !== undefined ? { featured: Boolean(data.featured) } : {}),
      ...(data.notion_id ? { notion_id: String(data.notion_id) } : {}),
    };
  });

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}
