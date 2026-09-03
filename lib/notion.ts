import "server-only";

const NOTION_API_BASE_URL = "https://api.notion.com/v1";
const NOTION_API_VERSION = "2026-03-11";
const BLOG_INDEX_TAG = "notion:blog:index";

type NotionRichText = {
  plain_text?: string;
};

type NotionProperty = {
  type?: string;
  checkbox?: boolean;
  date?: { start?: string | null } | null;
  select?: { name?: string | null } | null;
  multi_select?: Array<{ name?: string | null }>;
  title?: NotionRichText[];
  rich_text?: NotionRichText[];
  files?: Array<{
    name?: string;
    type?: "external" | "file";
    external?: { url?: string };
    file?: { url?: string };
  }>;
};

type NotionPage = {
  id: string;
  created_time: string;
  last_edited_time: string;
  properties: Record<string, NotionProperty>;
};

type NotionQueryResponse = {
  results: NotionPage[];
  has_more: boolean;
  next_cursor: string | null;
};

type NotionMarkdownResponse = {
  id: string;
  markdown: string;
  truncated: boolean;
  unknown_block_ids: string[];
};

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  updated_at?: string;
  category?: string;
  featured?: boolean;
  notion_id: string;
  excerpt?: string;
  thumbnail?: string;
}

export interface NotionPost extends PostMeta {
  markdown: string;
  truncated: boolean;
  unknownBlockIds: string[];
}

function requiredEnv(name: "NOTION_TOKEN" | "NOTION_DATA_SOURCE_ID") {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} 환경 변수가 필요합니다.`);
  }
  return value;
}

function notionHeaders() {
  return {
    Authorization: `Bearer ${requiredEnv("NOTION_TOKEN")}`,
    "Notion-Version": NOTION_API_VERSION,
    "Content-Type": "application/json",
  };
}

async function notionFetch<T>(
  path: string,
  init: RequestInit & { next: { revalidate: number | false; tags: string[] } },
): Promise<T> {
  const response = await fetch(`${NOTION_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...notionHeaders(),
      ...init.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Notion API 요청 실패 (${response.status}): ${body}`);
  }

  return response.json() as Promise<T>;
}

function plainText(value?: NotionRichText[]) {
  return value?.map((item) => item.plain_text ?? "").join("") ?? "";
}

function firstFileUrl(value?: NotionProperty) {
  const file = value?.files?.[0];
  return file?.external?.url ?? file?.file?.url;
}

export function slugify(title: string) {
  const ascii = title
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (ascii) return ascii;

  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\uAC00-\uD7A3\uFF00-\uFFEF가-힣-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function toPostMeta(page: NotionPage): PostMeta {
  const properties = page.properties;
  const title = plainText(properties.title?.title) || "Untitled";
  const categoryProperty = properties["카테고리"];
  const category =
    categoryProperty?.select?.name ??
    categoryProperty?.multi_select
      ?.map((item) => item.name)
      .filter((name): name is string => Boolean(name))
      .join(", ");
  const updatedAt = properties.updatedAt?.date?.start;

  return {
    slug: slugify(title) || page.id,
    title,
    date: page.created_time.slice(0, 10),
    ...(updatedAt ? { updated_at: updatedAt } : {}),
    ...(category ? { category } : {}),
    featured: properties["블로깅하면 좋아요"]?.checkbox ?? false,
    notion_id: page.id,
    ...(firstFileUrl(properties["썸네일"])
      ? { thumbnail: firstFileUrl(properties["썸네일"]) }
      : {}),
  };
}

async function queryBlogPages() {
  const pages: NotionPage[] = [];
  let cursor: string | null = null;

  do {
    const response: NotionQueryResponse = await notionFetch(
      `/data_sources/${requiredEnv("NOTION_DATA_SOURCE_ID")}/query`,
      {
        method: "POST",
        body: JSON.stringify({
          page_size: 100,
          ...(cursor ? { start_cursor: cursor } : {}),
          filter: {
            and: [
              { property: "타입", select: { equals: "블로그" } },
              { property: "상태", status: { equals: "완료" } },
            ],
          },
          sorts: [{ timestamp: "created_time", direction: "descending" }],
        }),
        cache: "force-cache",
        next: { revalidate: 60 * 60 * 24 * 3, tags: [BLOG_INDEX_TAG] },
      },
    );

    pages.push(...response.results);
    cursor = response.next_cursor;
  } while (cursor);

  return pages;
}

export async function getPostsMetadata(): Promise<PostMeta[]> {
  const posts = (await queryBlogPages()).map(toPostMeta);
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPostBySlug(slug: string) {
  const posts = await getPostsMetadata();
  return posts.find((post) => post.slug === slug) ?? null;
}

export async function getPostMarkdown(pageId: string): Promise<NotionMarkdownResponse> {
  return notionFetch(`/pages/${pageId}/markdown`, {
    method: "GET",
    cache: "force-cache",
    next: {
      revalidate: false,
      tags: [`notion:blog:post:${pageId}`],
    },
  });
}

export async function getPost(slug: string): Promise<NotionPost | null> {
  const post = await getPostBySlug(slug);
  if (!post) return null;

  const markdown = await getPostMarkdown(post.notion_id);
  return {
    ...post,
    markdown: markdown.markdown,
    truncated: markdown.truncated,
    unknownBlockIds: markdown.unknown_block_ids,
  };
}

export const notionCacheTags = {
  index: BLOG_INDEX_TAG,
  post: (pageId: string) => `notion:blog:post:${pageId}`,
};
