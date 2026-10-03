"use client";

import React, { useState, useMemo } from "react";
import { Search, SlidersHorizontal, LayoutGrid } from "lucide-react";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Project, ProjectCategory } from "@/types";

interface ProjectsExplorerProps {
  initialProjects: Project[];
}

export function ProjectsExplorer({ initialProjects }: ProjectsExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTech, setSelectedTech] = useState<string>("all");

  const categories: { label: string; value: ProjectCategory }[] = [
    { label: "All Projects", value: "all" },
    { label: "Fullstack", value: "fullstack" },
    { label: "Frontend", value: "frontend" },
    { label: "Backend", value: "backend" },
    { label: "IoT & Hardware", value: "iot" },
  ];

  const allTechs = useMemo(() => {
    const techSet = new Set<string>();
    initialProjects.forEach((p) => p.techStack.forEach((t) => techSet.add(t)));
    return Array.from(techSet).sort();
  }, [initialProjects]);

  const filteredProjects = useMemo(() => {
    return initialProjects.filter((project) => {
      if (project.status !== "published") return false;

      // Category filter
      if (selectedCategory !== "all" && project.category !== selectedCategory) {
        return false;
      }

      // Tech filter
      if (selectedTech !== "all" && !project.techStack.includes(selectedTech)) {
        return false;
      }

      // Search query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesTitle = project.title.toLowerCase().includes(query);
        const matchesSummary = project.summary.toLowerCase().includes(query);
        const matchesTech = project.techStack.some((t) =>
          t.toLowerCase().includes(query)
        );
        if (!matchesTitle && !matchesSummary && !matchesTech) return false;
      }

      return true;
    });
  }, [initialProjects, selectedCategory, selectedTech, searchQuery]);

  return (
    <>
      {/* Header Section */}
      <section className="w-full max-w-[1200px] px-4 sm:px-6 pt-12 pb-8 border-b border-[var(--border)]">
        <div className="flex flex-col gap-2 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[var(--text)] tracking-tight font-display">
            Projects
          </h1>
          <p className="text-base text-[var(--text-muted)] leading-relaxed">
            A comprehensive showcase of production web applications, municipal platforms,
            IoT telematics systems, and developer utilities.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mt-8 pt-6 border-t border-[var(--border)]">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap focus-ring cursor-pointer ${
                    isSelected
                      ? "bg-[var(--primary)] text-white font-semibold shadow-xs"
                      : "bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] border border-[var(--border)]"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search and Technology Dropdown */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 stroke-[1.75]" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-lg text-xs bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus-ring"
              />
            </div>

            <div className="relative">
              <select
                value={selectedTech}
                onChange={(e) => setSelectedTech(e.target.value)}
                className="h-9 px-3 pr-8 rounded-lg text-xs bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] focus-ring appearance-none cursor-pointer"
                aria-label="Filter by technology"
              >
                <option value="all">All Tech</option>
                {allTechs.map((tech) => (
                  <option key={tech} value={tech}>
                    {tech}
                  </option>
                ))}
              </select>
              <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[1.75]" />
            </div>
          </div>
        </div>
      </section>

      {/* Project Grid */}
      <section className="w-full max-w-[1200px] px-4 sm:px-6 py-12">
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<LayoutGrid className="w-6 h-6 stroke-[1.75]" />}
            title="No projects match your filter"
            description="Try adjusting your search query, selecting another category, or clearing filters."
            actionText="Reset Filters"
            onAction={() => {
              setSelectedCategory("all");
              setSelectedTech("all");
              setSearchQuery("");
            }}
          />
        )}
      </section>
    </>
  );
}
