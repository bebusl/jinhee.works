"use client";

import { useState, useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/header";

export default function PortfolioLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDarkMode = savedTheme ? savedTheme === "dark" : prefersDark;
    setIsDark(isDarkMode);
    updateTheme(isDarkMode);
  }, []);

  const updateTheme = (isDarkMode: boolean) => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  };

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    updateTheme(newIsDark);
  };

  const isHome = pathname === "/";

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background relative">
      <div
        className="fixed inset-0 dot-grid-bg opacity-60 pointer-events-none"
        aria-hidden="true"
      />

      {isHome && (
        <>
          <div
            className="fixed -top-48 -left-48 w-[650px] h-[650px] rounded-full bg-primary/10 blur-[110px] float-orb pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="fixed -bottom-32 -right-32 w-[550px] h-[550px] rounded-full bg-accent/10 blur-[100px] float-orb-alt pointer-events-none"
            aria-hidden="true"
          />
        </>
      )}

      <Header isDark={isDark} toggleTheme={toggleTheme} />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}
