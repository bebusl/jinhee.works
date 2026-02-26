export default function ResumeTab() {
  const experiences = [
    {
      role: "프론트엔드 개발자",
      company: "회사명",
      period: "20XX — Present",
      description: "여기에 어떤 일을 했는지 자유롭게 적어주세요.\n줄바꿈도 그대로 반영됩니다.\n\n예) React + TypeScript로 사내 어드민 대시보드를 처음부터 설계하고 개발했습니다.",
      skills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    },
  ];

  const skillGroups = [
    { category: "프론트엔드", items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Vue.js"] },
    { category: "백엔드", items: ["Node.js", "Python", "SQL", "Firebase"] },
    { category: "도구 & 인프라", items: ["Git", "Docker", "AWS", "Vercel"] },
  ];

  return (
    <div className="space-y-20 py-6">

      {/* ━━━ EXPERIENCE ━━━ */}
      <section>
        <h2 className="text-3xl sm:text-4xl font-bold mb-10 gradient-text">경력</h2>
        <div className="space-y-6">
          {experiences.map((exp, idx) => (
            <div
              key={idx}
              className="bg-card border border-border rounded-2xl p-7 sm:p-10 hover:border-primary/30 transition-colors duration-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-7 gap-3">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{exp.role}</h3>
                  <p className="text-primary font-semibold text-lg mt-1">{exp.company}</p>
                </div>
                <span className="text-xs text-muted-foreground bg-secondary/60 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap w-fit shrink-0">
                  {exp.period}
                </span>
              </div>

              <p className="text-foreground/70 leading-loose text-base whitespace-pre-line mb-7 pb-7 border-b border-border">
                {exp.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {exp.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-md text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ━━━ SKILLS ━━━ */}
      <section className="pb-12">
        <h2 className="text-3xl sm:text-4xl font-bold mb-10 gradient-text">기술 스택</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {skillGroups.map((group, idx) => (
            <div
              key={idx}
              className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-1.5 h-8 bg-linear-to-b from-primary to-accent rounded-full"
                  aria-hidden="true"
                />
                <h3 className="text-base font-bold text-foreground">{group.category}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.items.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-lg text-sm bg-secondary/50 text-foreground/80 border border-border group-hover:border-primary/25 transition-colors duration-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
