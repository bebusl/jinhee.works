"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export default function Header({ isDark, toggleTheme }: HeaderProps) {
  const pathname = usePathname();

  const tabs = [
    { id: "blog", label: "블로그", path: "/blog" },
    { id: "resume", label: "이력서", path: "/resume" },
    // { id: "projects", label: "미니프로젝트", path: "/projects" },
  ];

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  return (
    <header className="border-b-8 border-foreground bg-background relative">
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-[2rem] font-semibold leading-none mb-2 tracking-tighter">
              JINHEE.WORKS
            </h1>
          </div>
          <button
            onClick={toggleTheme}
            className="p-3  hover:bg-foreground hover:text-background transition-colors mt-2"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={28} /> : <Moon size={28} />}
          </button>
        </div>

        <div className="flex items-center justify-between mb-8">
          <nav className="flex gap-6">
            {tabs.map((tab) => {
              const active = isActive(tab.path);
              return (
                <Link
                  key={tab.id}
                  href={tab.path}
                  className={`border-b-8 pb-2 tracking-wider transition-colors cursor-pointer font-semibold ${
                    active
                      ? "text-foreground border-foreground"
                      : "text-muted-foreground border-transparent "
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
