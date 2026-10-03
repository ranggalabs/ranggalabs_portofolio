"use client";

import React from "react";
import Link from "next/link";
import { Sun, Moon, ArrowUpRight } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export interface AdminTopbarProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function AdminTopbar({ title, subtitle, action }: AdminTopbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 px-6 bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between sticky top-0 z-30">
      <div className="flex flex-col">
        <h1 className="text-base sm:text-lg font-semibold text-[var(--text)] tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-[var(--text-muted)] line-clamp-1">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors focus-ring"
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <Moon className="w-4 h-4 stroke-[1.75]" />
          ) : (
            <Sun className="w-4 h-4 stroke-[1.75]" />
          )}
        </button>

        {/* View live site quick button */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium rounded-lg bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--border)] transition-colors"
        >
          <span>Live Site</span>
          <ArrowUpRight className="w-3.5 h-3.5 stroke-[1.75]" />
        </Link>

        {/* Primary custom action button */}
        {action && <div>{action}</div>}
      </div>
    </header>
  );
}
