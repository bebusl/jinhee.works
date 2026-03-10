import { notFound } from "next/navigation";
import path from "path";
import fs from "fs";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/badge";

type Props = {
  params: Promise<{ slug: string }>;
};

const POSTS_DIR = path.join(process.cwd(), "posts");

export async function generateStaticParams() {
  const files = fs.readdirSync(POSTS_DIR);
  const mdFiles = files.filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));

  return mdFiles.map((file) => ({
    slug: file.replace(/\.(md|mdx)$/, ""),
  }));
}

export default async function Page({ params }: Props) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);

  console.log(slug);

  let filePath = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(POSTS_DIR, `${slug}.mdx`);
  }

  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  console.log(fileContent);

  const { content, data } = matter(fileContent);

  let mdxContent: React.ReactElement | null = null;
  let mdxError: string | null = null;

  try {
    const result = await compileMDX({
      source: content,
      options: {
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [],
        },
      },
    });
    mdxContent = result.content;
  } catch (err) {
    mdxError = err instanceof Error ? err.message : String(err);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-8 pb-8 border-b border-border">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          {data.title}
        </h1>
        <div className="flex items-center gap-3 flex-wrap text-sm text-muted-foreground">
          {data.date && <span>{String(data.date).slice(0, 10)}</span>}
          {data.updated_at && (
            <span>업데이트: {String(data.updated_at).slice(0, 10)}</span>
          )}
          {data.category && <Badge variant="secondary">{data.category}</Badge>}
          {data.featured && <span className="text-yellow-500">⭐</span>}
        </div>
      </header>
      <article className="prose dark:prose-invert max-w-none">
        {mdxError ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            <p className="font-semibold mb-1">콘텐츠를 불러올 수 없습니다.</p>
            <pre className="whitespace-pre-wrap text-xs opacity-75">{mdxError}</pre>
          </div>
        ) : (
          mdxContent
        )}
      </article>
    </div>
  );
}

export const dynamicParams = false;
