import { Github, ExternalLink } from "lucide-react";

const projects = [
  {
    id: 1,
    title: "E-commerce Platform",
    description: "장바구니, 결제 시스템, 관리자 대시보드를 포함한 풀스택 전자상거래 플랫폼",
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    label: "E-Commerce",
    tech: ["Next.js", "TypeScript", "Stripe", "Prisma", "PostgreSQL"],
    links: { demo: "#", github: "#" },
  },
  {
    id: 2,
    title: "Task Management App",
    description: "실시간 협업 기능이 있는 할일 관리 애플리케이션",
    gradient: "from-blue-500 via-cyan-500 to-teal-500",
    label: "Productivity",
    tech: ["React", "Firebase", "Tailwind CSS", "Redux"],
    links: { demo: "#", github: "#" },
  },
  {
    id: 3,
    title: "Weather Dashboard",
    description: "날씨 정보를 실시간으로 표시하는 인터랙티브 대시보드",
    gradient: "from-orange-400 via-amber-400 to-yellow-400",
    label: "Dashboard",
    tech: ["Vue.js", "OpenWeather API", "Chart.js"],
    links: { demo: "#", github: "#" },
  },
  {
    id: 4,
    title: "Social Media Analytics",
    description: "소셜 미디어 데이터를 수집하고 분석하는 대시보드",
    gradient: "from-pink-500 via-rose-500 to-red-500",
    label: "Analytics",
    tech: ["React", "Python", "Pandas", "D3.js"],
    links: { demo: "#", github: "#" },
  },
];

export default function ProjectsTab() {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl sm:text-4xl font-bold mb-3 gradient-text">미니 프로젝트들</h2>
        <p className="text-foreground/60 text-lg">다양한 기술 스택으로 만든 프로젝트들을 소개합니다.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
          >
            {/* Gradient banner */}
            <div className={`relative h-44 bg-linear-to-br ${project.gradient} flex items-center justify-center overflow-hidden`}>
              {/* Shimmer overlay */}
              <div className="absolute inset-0 bg-black/10" />
              {/* Grid pattern overlay */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
                aria-hidden="true"
              />
              <span className="relative text-white/90 font-black text-4xl tracking-tight select-none">
                {project.label}
              </span>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-7">
              <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
                {project.title}
              </h3>
              <p className="text-foreground/60 text-sm leading-relaxed mb-5">
                {project.description}
              </p>

              {/* Tech stack */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {project.tech.map((tech) => (
                  <span
                    key={tech}
                    className="text-xs px-2.5 py-1 rounded-md bg-secondary/60 text-foreground/70 border border-border font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Links */}
              <div className="flex gap-3">
                <a
                  href={project.links.demo}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-primary to-accent text-white font-semibold text-sm hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  데모 보기
                </a>
                <a
                  href={project.links.github}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-foreground/80 font-semibold text-sm hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 cursor-pointer"
                >
                  <Github className="w-3.5 h-3.5" aria-hidden="true" />
                  GitHub
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
