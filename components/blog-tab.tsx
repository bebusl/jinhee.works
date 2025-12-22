export default function BlogTab() {
  const posts = [
    {
      id: 1,
      title: "React 18의 새로운 기능들",
      excerpt:
        "React 18에서 소개된 Concurrent Features와 Automatic Batching에 대해 알아봅시다.",
      date: "2024.11.15",
      category: "React",
      readTime: "5 min",
      tags: ["React", "JavaScript", "Web Dev"],
    },
    {
      id: 2,
      title: "Next.js 성능 최적화 팁",
      excerpt:
        "이미지 최적화, 코드 스플리팅, 캐싱 전략으로 Next.js 앱의 성능을 극대화하세요.",
      date: "2024.11.10",
      category: "Next.js",
      readTime: "8 min",
      tags: ["Next.js", "Performance", "Web"],
    },
    {
      id: 3,
      title: "TypeScript로 안전한 코드 작성하기",
      excerpt:
        "타입 시스템을 활용하여 런타임 에러를 줄이고 더 안전한 코드를 작성하는 방법.",
      date: "2024.11.05",
      category: "TypeScript",
      readTime: "6 min",
      tags: ["TypeScript", "Best Practices"],
    },
    {
      id: 4,
      title: "CSS-in-JS vs Tailwind CSS",
      excerpt:
        "현대적인 스타일링 솔루션들을 비교 분석하고 선택 기준을 알아봅시다.",
      date: "2024.10.28",
      category: "CSS",
      readTime: "7 min",
      tags: ["CSS", "Styling", "Frontend"],
    },
  ];

  const categories = ["전체", "React", "Next.js", "TypeScript", "CSS"];

  return (
    <div className="space-y-8">
      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
              cat === "전체"
                ? "bg-linear-to-r from-primary to-accent text-primary-foreground shadow-md"
                : "bg-card text-foreground hover:border-primary/50 border border-border"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Blog Posts Grid */}
      <div className="grid gap-6">
        {posts.map((post) => (
          <article
            key={post.id}
            className="bg-card rounded-lg p-6 sm:p-8  border border-border hover:border-primary transition-colors duration-300"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between sm:gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <span className="px-4 py-1.5 rounded-md text-xs font-bold bg-primary/10 text-primary">
                    {post.category}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {post.date}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-foreground hover:text-primary transition-colors">
                  {post.title}
                </h3>
              </div>
              <span className="text-xs text-muted-foreground mt-3 sm:mt-0 whitespace-nowrap">
                {post.readTime}
              </span>
            </div>

            <p className="text-foreground/80 mb-6">{post.excerpt}</p>

            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-accent bg-accent/10 px-3 py-1.5 rounded-md border border-accent/30"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
