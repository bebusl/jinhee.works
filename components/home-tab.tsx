import { Github } from "lucide-react";

type Tab = "home" | "resume" | "blog" | "projects";

interface Props {
  setActiveTab: (tab: Tab) => void;
}

export default function HomeTab({ setActiveTab }: Props) {
  return (
    <section className="min-h-[88vh] flex flex-col justify-center relative py-12">
      <div className="relative z-10 max-w-4xl space-y-8">
        {/* Availability badge */}
        <div className="fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 w-fit">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true" />
          <span className="text-green-600 dark:text-green-400 text-sm font-medium">
            Available for opportunities
          </span>
        </div>

        {/* Greeting + Name */}
        <div className="fade-up-1">
          <p className="text-muted-foreground text-xs font-bold tracking-[0.25em] uppercase mb-4">
            안녕하세요, 저는
          </p>
          <h1
            className="font-black leading-[0.88] tracking-tight gradient-text"
            style={{ fontSize: "clamp(4rem, 13vw, 9.5rem)" }}
          >
            Jinhee
          </h1>
        </div>

        {/* Role divider */}
        <div className="fade-up-2 flex items-center gap-5">
          <div
            className="h-0.5 w-14 bg-linear-to-r from-primary to-accent rounded-full shrink-0"
            aria-hidden="true"
          />
          <h2 className="text-xl sm:text-2xl text-foreground/65 font-medium">
            Frontend Developer &amp; Web Enthusiast
          </h2>
        </div>

        {/* Bio */}
        <p className="fade-up-3 text-foreground/60 text-lg max-w-xl leading-relaxed">
          사용자 중심의 웹 애플리케이션을 만드는 것을 좋아합니다. React, Next.js,
          TypeScript를 주로 사용하며 아름다운 UI와 좋은 개발자 경험을 추구합니다.
        </p>

        {/* CTA buttons */}
        <div className="fade-up-4 flex flex-wrap gap-4">
          <button
            onClick={() => setActiveTab("projects")}
            className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-linear-to-r from-primary to-accent text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
          >
            프로젝트 보기
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-border text-foreground font-semibold hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 cursor-pointer"
          >
            <Github className="w-4 h-4" aria-hidden="true" />
            GitHub
          </a>
        </div>

        {/* Stats */}
        <div className="fade-up-5 flex flex-wrap gap-10 pt-6 border-t border-border">
          {[
            { value: "3+", label: "년 경력" },
            { value: "20+", label: "프로젝트 완성" },
            { value: "5+", label: "기술 스택" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-4xl font-black gradient-text">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
