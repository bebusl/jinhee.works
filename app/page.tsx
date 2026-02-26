import { getPostsMetadata } from "@/lib/posts";
import PortfolioClient from "@/components/portfolio-client";

export default function Page() {
  const posts = getPostsMetadata();
  return <PortfolioClient posts={posts} />;
}
