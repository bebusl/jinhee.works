"use client";

import type { Dispatch, SetStateAction } from "react";
import { Moon, Sun } from "lucide-react";
import Stars from "./ui/stars";

interface HeaderProps {
  activeTab: "resume" | "blog" | "projects";
  setActiveTab: Dispatch<SetStateAction<"resume" | "blog" | "projects">>;
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
    { id: "resume", label: "이력서" },
    { id: "blog", label: "블로그" },
    { id: "projects", label: "미니프로젝트" },
  ] as const;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-6 gap-6">
          {/* Logo/Title */}
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center justify-center w-12 h-12">
              <Stars />
            </div>
            <div className="select-none">
              <h1 className="text-3xl sm:text-4xl font-bold">
                <span className="gradient-text">Jinhee.Works</span>
              </h1>
              <p className="text-muted-foreground text-xs mt-1">
                기술 블로그 & 포트폴리오
              </p>
            </div>
          </div>

          {/* Navigation and Theme Toggle */}
          <div className="flex items-center gap-6 sm:gap-8 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
            {/* Navigation Tabs */}
            <nav className="flex gap-6 sm:gap-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-sm sm:text-base font-medium transition-all duration-300 cursor-pointer ${
                    activeTab === tab.id
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg bg-secondary/50 hover:bg-primary/20 text-foreground transition-all duration-300 border border-border"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
