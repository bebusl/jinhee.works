"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import ResumeTab from "@/components/resume-tab"
import BlogTab from "@/components/blog-tab"
import ProjectsTab from "@/components/projects-tab"

export default function Page() {
  const [activeTab, setActiveTab] = useState<"resume" | "blog" | "projects">("resume")
  const [isDark, setIsDark] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const isDarkMode = savedTheme ? savedTheme === "dark" : prefersDark
    setIsDark(isDarkMode)
    updateTheme(isDarkMode)
  }, [])

  const updateTheme = (isDarkMode: boolean) => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    localStorage.setItem("theme", isDarkMode ? "dark" : "light")
  }

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    updateTheme(newIsDark)
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} isDark={isDark} toggleTheme={toggleTheme} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {activeTab === "resume" && <ResumeTab />}
        {activeTab === "blog" && <BlogTab />}
        {activeTab === "projects" && <ProjectsTab />}
      </main>
    </div>
  )
}
