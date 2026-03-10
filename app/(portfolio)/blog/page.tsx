import BlogTab from "@/components/blog-tab";
import { getPostsMetadata } from "@/lib/posts";

export default function Page() {
  const posts = getPostsMetadata();
  return <BlogTab posts={posts} />;
}
