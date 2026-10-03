import React from "react";
import { Button } from "./Button";

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionText,
  onAction,
  actionHref,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-12 rounded-xl bg-[var(--surface)] border border-[var(--border)] gap-3 ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)]">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-[var(--text)] mt-1">{title}</h3>
      <p className="text-sm text-[var(--text-muted)] max-w-sm leading-relaxed">
        {description}
      </p>
      {actionText && (
        <div className="mt-2">
          {actionHref ? (
            <Button variant="secondary" size="md" href={actionHref}>
              {actionText}
            </Button>
          ) : (
            <Button variant="secondary" size="md" onClick={onAction}>
              {actionText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
