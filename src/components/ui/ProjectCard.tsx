import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { TechChip } from "./TechChip";
import { Project } from "@/types";

export interface ProjectCardProps {
  project: Project;
  priority?: boolean;
}

export function ProjectCard({ project, priority }: ProjectCardProps) {
  const visibleTech = project.techStack.slice(0, 3);
  const remainingCount = project.techStack.length - visibleTech.length;

  return (
    <article className="group flex flex-col rounded-xl overflow-hidden bg-[var(--surface)] border border-[var(--border)] transition-all duration-200 hover:shadow-md hover:border-[var(--primary)]/40">
      <Link
        href={`/projects/${project.slug}`}
        className="block relative aspect-video w-full overflow-hidden bg-[var(--surface-2)]"
      >
        <Image
          src={project.coverImage}
          alt={project.coverAlt || project.title}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
        />
        {/* Year Pill overlay matching Figma */}
        <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[11px] font-mono-code font-semibold tracking-wide bg-white/95 dark:bg-black/80 backdrop-blur-md text-neutral-900 dark:text-[var(--text)] border border-black/10 dark:border-[var(--border)] shadow-sm">
          {project.year}
        </div>
      </Link>

      <div className="flex flex-col flex-1 p-6 justify-between gap-4">
        <div className="flex flex-col gap-2">
          {/* Category & Arrow row */}
          <div className="flex items-center justify-between">
            <span className="font-mono-code text-[11px] tracking-wider uppercase text-[var(--text-muted)] font-medium">
              {project.categoryDisplay || project.category.toUpperCase()}
            </span>
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--primary)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
              <ArrowUpRight className="w-4 h-4 stroke-[1.75]" />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors line-clamp-1">
            <Link href={`/projects/${project.slug}`}>{project.title}</Link>
          </h3>

          {/* Summary clamped to 2 lines */}
          <p className="text-sm text-[var(--text-muted)] leading-relaxed line-clamp-2">
            {project.summary}
          </p>
        </div>

        {/* Footer Tech Chips */}
        <div className="flex items-center gap-1.5 pt-3 border-t border-[var(--border)] flex-wrap">
          {visibleTech.map((tech) => (
            <TechChip key={tech} label={tech} size="sm" />
          ))}
          {remainingCount > 0 && (
            <TechChip label={`+${remainingCount}`} size="sm" />
          )}
        </div>
      </div>
    </article>
  );
}
