"use client";

import { useState } from "react";
import Link from "next/link";
import type { PostMeta } from "@/lib/posts";

interface Props {
  posts: PostMeta[];
}

export default function BlogTab({ posts }: Props) {
  const categories = [
    "전체",
    ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean))),
  ];
  const [activeCategory, setActiveCategory] = useState("전체");

  const filtered =
    activeCategory === "전체"
      ? posts
      : posts.filter((p) => p.category === activeCategory);

  return (
    <div className="space-y-8 mt-6 md:mt-8">
      <div className="flex gap-2">
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => {
            const isActive = (category ?? "전체") === activeCategory;

            return (
              <button
                key={`${category}-filter-button`}
                onClick={() => setActiveCategory(category ?? "전체")}
                className={`px-6 py-3 border-2 border-foreground transition-colors tracking-wider cursor-pointer font-semibold ${
                  isActive
                    ? "bg-foreground text-background"
                    : "bg-background text-foreground hover:bg-foreground hover:text-background"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Posts grid */}
      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-muted-foreground text-lg">
              아직 게시된 글이 없습니다.
            </p>
          </div>
        ) : (
          filtered.map((post, index) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <PostCard post={post} index={index} />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

function PostCard({ post, index }: { post: PostMeta; index: number }) {
  return (
    <article
      className={`grid grid-cols-1 md:grid-cols-3 gap-0 border-2 border-foreground bg-background hover:shadow-[12px_12px_0_0_currentColor] transition-shadow cursor-pointer ${
        index % 2 === 0 ? "" : "md:grid-flow-dense"
      }`}
    >
      <div
        className={`aspect-4/3 overflow-hidden border-foreground ${index % 2 === 0 ? "md:border-r-8" : "md:col-start-3 md:border-l-8"}`}
      >
        <img
          src={post.thumbnail ?? "/placeholder-post.avif"}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      <div
        className={`col-span-2 p-8 flex flex-col justify-between ${index % 2 === 0 ? "" : "md:col-start-1"}`}
      >
        <div>
          <div className="flex gap-3 mb-4">
            {post.category && (
              <span className="px-3 py-1 border-4 border-foreground bg-foreground text-background text-[0.75rem] tracking-widest">
                {post.category}
              </span>
            )}
          </div>
          <h2 className="mb-4 text-[1.5rem] leading-tight">{post.title}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {post.excerpt ?? "요약본이 없어요💧"}
          </p>
        </div>
        <div className="mt-6 pt-6 border-t-4 border-foreground">
          <time className="tracking-wider text-muted-foreground">
            {post.date}
          </time>
        </div>
      </div>
    </article>
  );
}
