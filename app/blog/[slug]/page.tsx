import { notFound } from "next/navigation";
import path from "path";
import fs from "fs";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

type Props = {
  params: { slug: string };
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
  const { slug } = await params;

  // .md 또는 .mdx 파일 찾기
  let filePath = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(POSTS_DIR, `${slug}.mdx`);
  }

  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { content, data } = matter(fileContent);

  return (
    <div className="prose">
      {/* 필요하면 frontmatter 데이터 사용 가능: data.title, data.author 등 */}
      <MDXRemote
        source={content}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [],
          },
        }}
      />
    </div>
  );
}

export const dynamicParams = false;
