import { useEffect, useState } from "react";
import { fetchData } from "./blog-action";
import { type PageObjectResponse } from "@notionhq/client";
import Link from "next/link";

export default function BlogTab() {
  const [data, setData] = useState<PageObjectResponse[]>();

  useEffect(() => {
    (async () => {
      const res = await fetchData();
      setData(res);
    })();
  }, []);

  console.log("[RES:::]", data);

  return (
    <div className="space-y-8">
      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {/* {data.map((r) => (
          <button
            key={r.id}
            className={`px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
              cat === "전체"
                ? "bg-linear-to-r from-primary to-accent text-primary-foreground shadow-md"
                : "bg-card text-foreground hover:border-primary/50 border border-border"
            }`}
          >
            {r.title.title}
          </button>
        ))} */}
      </div>

      {/* Blog Posts Grid */}
      <div className="grid gap-6">
        {data?.map((post, idx) => (
          <Link key={idx} href={`blog/${post.id}`}>
            <article className="bg-card rounded-lg p-6 sm:p-8  border border-border hover:border-primary transition-colors duration-300">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between sm:gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <span className="px-4 py-1.5 rounded-md text-xs font-bold bg-primary/10 text-primary">
                      {new Date(post.created_time).toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {/* {post.date} */}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground hover:text-primary transition-colors">
                    {post.properties.title.title[0].plain_text}
                  </h3>
                </div>
                <span className="text-xs text-muted-foreground mt-3 sm:mt-0 whitespace-nowrap">
                  {/* {post.readTime} */}
                </span>
              </div>

              <p className="text-foreground/80 mb-6">{/* {post.excerpt} */}</p>

              <div className="flex flex-wrap gap-2">
                {/* {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-accent bg-accent/10 px-3 py-1.5 rounded-md border border-accent/30"
                >
                  #{tag}
                </span>
              ))} */}
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
