import { notFound } from "next/navigation";
import path from "path";
import fs from "fs";

type Props = {
  params: { slug: string };
};

const POSTS_DIR = path.join(process.cwd(), "posts");

export async function generateStaticParams() {
  const files = await fs.readdirSync(POSTS_DIR);
  const mdFiles = files.filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));

  return mdFiles.map((file) => ({
    slug: file.replace(".md", ""),
  }));
}

export default async function Page({ params }: Props) {
  const { slug } = await params;

  try {
    const { default: Post } = await import(`@/posts/${slug}.md`);
    return <Post />;
  } catch (error) {
    notFound();
  }
}

export const dynamicParams = false;
