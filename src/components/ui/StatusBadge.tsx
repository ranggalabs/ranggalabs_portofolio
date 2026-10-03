import React from "react";

export type StatusType = "published" | "draft" | "new" | "read" | "replied" | "available";

export interface StatusBadgeProps {
  status: StatusType;
  customLabel?: string;
  className?: string;
}

export function StatusBadge({ status, customLabel, className = "" }: StatusBadgeProps) {
  const configs: Record<
    StatusType,
    { label: string; dotClass: string; textClass: string; bgClass: string; borderClass: string }
  > = {
    published: {
      label: "Published",
      dotClass: "bg-[var(--success)]",
      textClass: "text-[var(--text)]",
      bgClass: "bg-[var(--surface-2)]",
      borderClass: "border-[var(--border)]",
    },
    draft: {
      label: "Draft",
      dotClass: "bg-[var(--warning)]",
      textClass: "text-[var(--text)]",
      bgClass: "bg-[var(--surface-2)]",
      borderClass: "border-[var(--border)]",
    },
    new: {
      label: "New",
      dotClass: "bg-[var(--primary)]",
      textClass: "text-[var(--text)]",
      bgClass: "bg-[var(--surface-2)]",
      borderClass: "border-[var(--border)]",
    },
    read: {
      label: "Read",
      dotClass: "bg-[var(--text-muted)]",
      textClass: "text-[var(--text-muted)]",
      bgClass: "bg-[var(--surface-2)]",
      borderClass: "border-[var(--border)]",
    },
    replied: {
      label: "Replied",
      dotClass: "bg-[var(--primary)]",
      textClass: "text-[var(--text-muted)]",
      bgClass: "bg-[var(--surface-2)]",
      borderClass: "border-[var(--border)]",
    },
    available: {
      label: "Available for projects",
      dotClass: "bg-[var(--success)] animate-pulse",
      textClass: "text-[var(--text)]",
      bgClass: "bg-[var(--surface-2)]",
      borderClass: "border-[var(--border)]",
    },
  };

  const current = configs[status] || configs.read;
  const label = customLabel || current.label;

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${current.bgClass} ${current.borderClass} ${current.textClass} ${className}`}
    >
      <span className={`w-2 h-2 rounded-full shrink-0 ${current.dotClass}`} />
      <span>{label}</span>
    </span>
  );
}
