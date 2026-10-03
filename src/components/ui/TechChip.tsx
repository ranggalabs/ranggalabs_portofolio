import React from "react";

export interface TechChipProps {
  label: string;
  icon?: React.ReactNode;
  size?: "sm" | "md";
  className?: string;
}

export function TechChip({
  label,
  icon,
  size = "md",
  className = "",
}: TechChipProps) {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px] leading-4 gap-1",
    md: "px-3 py-1 text-xs leading-4 gap-1.5",
  };

  return (
    <span
      className={`inline-flex items-center font-mono-code rounded-lg bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] transition-colors hover:border-[var(--primary)]/30 ${sizeStyles[size]} ${className}`}
    >
      {icon && <span className="w-3.5 h-3.5 flex items-center justify-center text-[var(--text-muted)]">{icon}</span>}
      <span>{label}</span>
    </span>
  );
}
