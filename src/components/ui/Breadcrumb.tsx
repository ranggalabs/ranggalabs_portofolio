import React from "react";
import Link from "next/link";
import { ChevronRight, House } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-sm ${className}`}>
      <ol className="flex items-center gap-1.5 text-[var(--text-muted)] flex-wrap">
        <li>
          <Link
            href="/"
            className="flex items-center hover:text-[var(--text)] transition-colors focus-ring rounded"
            aria-label="Home"
          >
            <House className="w-4 h-4 stroke-[1.75]" />
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={index}>
              <li className="select-none text-[var(--border)]">
                <ChevronRight className="w-3.5 h-3.5 stroke-[1.75]" />
              </li>
              <li className="truncate max-w-[200px] sm:max-w-xs">
                {isLast || !item.href ? (
                  <span
                    className="font-medium text-[var(--text)]"
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-[var(--text)] transition-colors focus-ring rounded"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
