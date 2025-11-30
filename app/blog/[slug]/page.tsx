type Props = {
  params: Promise<{ slug: string }>;
};

export default async function Page({ params }: Props) {
  const { slug } = await params;
  console.log("SLUG", slug);
  const { default: Post } = await import(`@/posts/${slug}.md`);

  return <Post />;
}
