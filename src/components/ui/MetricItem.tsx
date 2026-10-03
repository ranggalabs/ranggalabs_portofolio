import React from "react";

export interface MetricItemProps {
  value: string;
  label: string;
  description?: string;
  className?: string;
}

export function MetricItem({
  value,
  label,
  description,
  className = "",
}: MetricItemProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[var(--primary)] font-display tracking-tight">
        {value}
      </div>
      <div className="text-base sm:text-lg font-semibold text-[var(--text)]">
        {label}
      </div>
      {description && (
        <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mt-0.5">
          {description}
        </p>
      )}
    </div>
  );
}
