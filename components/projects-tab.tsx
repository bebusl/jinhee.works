export default function ProjectsTab() {
  const projects = [
    {
      id: 1,
      title: "E-commerce Platform",
      description: "장바구니, 결제 시스템, 관리자 대시보드를 포함한 풀스택 전자상거래 플랫폼",
      image: "/ecommerce-dashboard.jpg",
      tech: ["Next.js", "TypeScript", "Stripe", "Prisma", "PostgreSQL"],
      links: {
        demo: "#",
        github: "#",
      },
    },
    {
      id: 2,
      title: "Task Management App",
      description: "실시간 협업 기능이 있는 할일 관리 애플리케이션",
      image: "/task-management-app.jpg",
      tech: ["React", "Firebase", "Tailwind CSS", "Redux"],
      links: {
        demo: "#",
        github: "#",
      },
    },
    {
      id: 3,
      title: "Weather Dashboard",
      description: "날씨 정보를 실시간으로 표시하는 인터랙티브 대시보드",
      image: "/weather-app-interface.png",
      tech: ["Vue.js", "OpenWeather API", "Chart.js"],
      links: {
        demo: "#",
        github: "#",
      },
    },
    {
      id: 4,
      title: "Social Media Analytics",
      description: "소셜 미디어 데이터를 수집하고 분석하는 대시보드",
      image: "/analytics-dashboard.png",
      tech: ["React", "Python", "Pandas", "D3.js"],
      links: {
        demo: "#",
        github: "#",
      },
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl sm:text-4xl font-bold mb-3 gradient-text">미니 프로젝트들</h2>
        <p className="text-foreground/80 text-lg">다양한 기술 스택으로 만든 프로젝트들을 소개합니다.</p>
      </div>

      {/* Projects Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-card rounded-lg overflow-hidden card-hover border border-border">
            {/* Project Image */}
            <div className="relative h-56 overflow-hidden bg-secondary/50">
              <img
                src={project.image || "/placeholder.svg"}
                alt={project.title}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
              />
            </div>

            {/* Project Content */}
            <div className="p-6 sm:p-8">
              <h3 className="text-2xl font-bold text-foreground mb-3 hover:text-primary transition-colors">
                {project.title}
              </h3>
              <p className="text-foreground/80 mb-6">{project.description}</p>

              {/* Tech Stack */}
              <div className="flex flex-wrap gap-2 mb-6">
                {project.tech.map((tech) => (
                  <span
                    key={tech}
                    className="text-xs px-3 py-1.5 rounded-md bg-primary/10 text-primary border border-primary/20 font-semibold"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Links */}
              <div className="flex gap-3">
                <a
                  href={project.links.demo}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-sm hover:shadow-md transition-all duration-300 text-center"
                >
                  데모 보기
                </a>
                <a
                  href={project.links.github}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-accent text-accent font-semibold text-sm hover:bg-accent/10 transition-colors text-center"
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
