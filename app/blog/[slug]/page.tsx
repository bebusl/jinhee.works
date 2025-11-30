import { notFound } from "next/navigation";

type Props = {
  params: { slug: string };
};

export default async function Page({ params }: Props) {
  const { slug } = await params;

  try {
    const { default: Post } = await import(`@/posts/${slug}.md`);
    return <Post />;
  } catch (error) {
    notFound();
  }
}
