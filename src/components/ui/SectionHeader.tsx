import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export interface SectionHeaderProps {
  title: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  className?: string;
}

export function SectionHeader({
  title,
  description,
  actionText,
  actionHref,
  className = "",
}: SectionHeaderProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 ${className}`}
    >
      <div className="flex flex-col gap-2 max-w-2xl">
        <h2 className="text-2xl sm:text-3xl font-semibold text-[var(--text)] tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-base text-[var(--text-muted)] leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actionText && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)] shrink-0 transition-colors group"
        >
          <span>{actionText}</span>
          <ArrowUpRight className="w-4 h-4 stroke-[1.75] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      )}
    </div>
  );
}
