import React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "md" | "lg" | "sm";
  href?: string;
  external?: boolean;
  download?: boolean | string;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  external,
  download,
  isLoading,
  icon,
  iconRight,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 focus-ring cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed";

  const sizeStyles = {
    sm: "h-8 px-3 text-xs gap-1.5",
    md: "h-10 px-4 text-sm gap-2",
    lg: "h-12 px-6 text-sm gap-2 font-medium",
  };

  const variantStyles = {
    primary:
      "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] active:opacity-95 shadow-sm",
    secondary:
      "bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--surface-2)] active:bg-[var(--border)]",
    ghost:
      "bg-transparent text-[var(--text)] hover:bg-[var(--surface-2)] active:bg-[var(--border)]",
    danger:
      "bg-[var(--danger)] text-white hover:opacity-90 active:opacity-100 shadow-sm",
  };

  const combinedClass = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  if (href) {
    if (external || download) {
      return (
        <a
          href={href}
          download={download}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className={combinedClass}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
          {children}
          {iconRight}
        </a>
      );
    }
    return (
      <Link href={href} className={combinedClass}>
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
        {children}
        {iconRight}
      </Link>
    );
  }

  return (
    <button
      className={combinedClass}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
      {iconRight}
    </button>
  );
}
