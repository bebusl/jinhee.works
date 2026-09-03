import BlogTab from "@/components/blog-tab";
import { getPostsMetadata } from "@/lib/posts";

export default async function Page() {
  const posts = await getPostsMetadata();
  return <BlogTab posts={posts} />;
}
