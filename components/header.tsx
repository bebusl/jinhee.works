"use client";

import type { Dispatch, SetStateAction } from "react";
import { Moon, Sun } from "lucide-react";
import type { Tab } from "@/components/portfolio-client";

interface HeaderProps {
  activeTab: Tab;
  setActiveTab: Dispatch<SetStateAction<Tab>>;
  isDark: boolean;
  toggleTheme: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  isDark,
  toggleTheme,
}: HeaderProps) {
  const tabs = [
    { id: "home",     label: "홈" },
    { id: "resume",   label: "이력서" },
    { id: "blog",     label: "블로그" },
    { id: "projects", label: "미니프로젝트" },
  ] as const;

  return (
    <header className="sticky top-3 z-50 px-3 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-background/85 backdrop-blur-xl border border-border/70 rounded-2xl shadow-lg shadow-black/5 dark:shadow-black/30 px-4 sm:px-5 py-3">
          <div className="flex items-center justify-between gap-4">

            {/* Logo */}
            <button
              onClick={() => setActiveTab("home")}
              className="flex items-center gap-2.5 cursor-pointer shrink-0"
              aria-label="홈으로 이동"
            >
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-md shadow-primary/25 shrink-0">
                <span className="text-white font-bold text-sm select-none">J</span>
              </div>
              <span className="text-base font-bold gradient-text select-none hidden sm:block">
                Jinhee.Works
              </span>
            </button>

            {/* Nav + Theme toggle */}
            <div className="flex items-center gap-1 sm:gap-2">
              <nav className="flex gap-0.5" aria-label="주 메뉴">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-3 sm:px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer ${
                      activeTab === tab.id
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    }`}
                    aria-current={activeTab === tab.id ? "page" : undefined}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <span
                        className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-primary rounded-full"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                ))}
              </nav>

              <div className="w-px h-5 bg-border mx-1" aria-hidden="true" />

              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all duration-200 cursor-pointer"
                aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
              >
                {isDark ? (
                  <Sun className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Moon className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
