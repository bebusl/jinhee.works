import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/mdx/Toggle";
import { Callout } from "@/components/mdx/Callout";
import { getPost } from "@/lib/posts";
import { rewriteNotionAssetUrls } from "@/lib/notion-assets";
import { normalizeNotionMarkdown } from "@/lib/normalize-notion-markdown";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function Page({ params }: Props) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);

  const post = await getPost(slug);
  if (!post) notFound();
  const normalized = normalizeNotionMarkdown(
    rewriteNotionAssetUrls(post.markdown, post.notion_id),
    {
    truncated: post.truncated,
    unknownBlockIds: post.unknownBlockIds,
    },
  );

  let mdxContent: React.ReactElement | null = null;
  let mdxError: string | null = null;

  try {
    const result = await compileMDX({
      source: normalized.markdown,
      options: {
        parseFrontmatter: false,
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [],
        },
      },
      components: { Toggle, Callout },
    });
    mdxContent = result.content;
  } catch (err) {
    mdxError = err instanceof Error ? err.message : String(err);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-8 pb-8 border-b border-border">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          {post.title}
        </h1>
        <div className="flex items-center gap-3 flex-wrap text-sm text-muted-foreground">
          <span>{post.date}</span>
          {post.updated_at && (
            <span>업데이트: {post.updated_at.slice(0, 10)}</span>
          )}
          {post.category && (
            <Badge variant="secondary">{post.category}</Badge>
          )}
          {post.featured && <span className="text-yellow-500">⭐</span>}
        </div>
      </header>
      <article className="prose dark:prose-invert max-w-none">
        {mdxError ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            <p className="font-semibold mb-1">콘텐츠를 불러올 수 없습니다.</p>
            <pre className="whitespace-pre-wrap text-xs opacity-75">
              {mdxError}
            </pre>
          </div>
        ) : (
          mdxContent
        )}
      </article>
    </div>
  );
}
