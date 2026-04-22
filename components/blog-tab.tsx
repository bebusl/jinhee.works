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
      {/* Category filter */}
      <div className="flex gap-2">
        {categories.map((cat) => {
          const isActive = (cat ?? "전체") === activeCategory;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat ?? "전체")}
              className={`px-1 py-2 min-w-13 text-sm font-medium transition-all duration-200 cursor-pointer  -mb-px border-b-3 ${
                isActive
                  ? "border-neutral-800 text-foreground font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-neutral-300"
              }`}
            >
              {cat}
            </button>
          );
        })}
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
          filtered.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <article className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-200/40 hover:bg-gray-200/70 border border-border/60 hover:border-border rounded-2xl px-7 py-6 transition-all duration-200 cursor-pointer">
                <div className="flex-1 min-w-0 space-y-2.5">
                  {/* Meta row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {post.category && (
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-foreground/8 text-foreground/60 border border-border/60">
                        {post.category}
                      </span>
                    )}
                    {post.featured && (
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/15">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-foreground/90 group-hover:text-foreground transition-colors duration-200 leading-snug">
                    {post.title}
                  </h3>
                </div>

                {/* Date + arrow */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-muted-foreground font-medium tabular-nums">
                    {post.date}
                  </span>
                  <svg
                    className="w-4 h-4 text-muted-foreground/40 group-hover:text-foreground/60 group-hover:translate-x-1 transition-all duration-200"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </article>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
