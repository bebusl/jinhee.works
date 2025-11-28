export default function ResumeTab() {
  const experiences = [
    {
      role: "시니어 프론트엔드 개발자",
      company: "Tech Company",
      period: "2022 - Present",
      description: "대규모 웹 애플리케이션 개발 및 팀 리더십",
      skills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    },
    {
      role: "프론트엔드 개발자",
      company: "Startup",
      period: "2020 - 2022",
      description: "SPA 개발 및 성능 최적화",
      skills: ["React", "JavaScript", "CSS", "Node.js"],
    },
  ]

  const skills = [
    { category: "프론트엔드", items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Vue.js"] },
    { category: "백엔드", items: ["Node.js", "Python", "SQL", "Firebase"] },
    { category: "도구", items: ["Git", "Docker", "AWS", "Vercel"] },
  ]

  return (
    <div className="space-y-12">
      {/* Intro */}
      <section>
        <h2 className="text-3xl sm:text-4xl font-bold mb-4 gradient-text">About Me</h2>
        <div className="bg-card rounded-lg p-6 border border-border">
          <p className="text-foreground/90 leading-relaxed text-lg">
            안녕하세요! 저는 사용자 중심의 웹 애플리케이션을 만드는 것을 좋아하는 개발자입니다. 최신 기술을 배우고 실제
            프로젝트에 적용하는 것을 즐깁니다.
          </p>
        </div>
      </section>

      {/* Experience */}
      <section>
        <h2 className="text-3xl sm:text-4xl font-bold mb-8 gradient-text">경력</h2>
        <div className="space-y-6">
          {experiences.map((exp, idx) => (
            <div key={idx} className="bg-card rounded-lg p-6 sm:p-8 card-hover border border-border">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{exp.role}</h3>
                  <p className="text-primary font-semibold text-lg mt-1">{exp.company}</p>
                </div>
                <span className="text-sm text-muted-foreground mt-3 sm:mt-0 bg-secondary/50 px-3 py-1 rounded-md">
                  {exp.period}
                </span>
              </div>
              <p className="text-foreground/80 mb-6">{exp.description}</p>
              <div className="flex flex-wrap gap-2">
                {exp.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-4 py-1.5 rounded-md text-sm bg-primary/10 text-primary border border-primary/20"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section>
        <h2 className="text-3xl sm:text-4xl font-bold mb-8 gradient-text">기술 스택</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skillGroup, idx) => (
            <div key={idx} className="bg-card rounded-lg p-8 card-hover border border-border">
              <h3 className="text-xl font-bold text-primary mb-6">{skillGroup.category}</h3>
              <ul className="space-y-3">
                {skillGroup.items.map((skill) => (
                  <li key={skill} className="text-foreground/90 flex items-center gap-3">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
