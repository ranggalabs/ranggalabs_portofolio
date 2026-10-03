import React, { useEffect } from "react";
import { CircleCheck, TriangleAlert, CircleX, Info, X } from "lucide-react";

export type ToastType = "success" | "warning" | "error" | "info";

export interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
  duration?: number;
}

export function Toast({
  type = "info",
  message,
  onClose,
  duration = 4000,
}: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const configs = {
    success: {
      icon: <CircleCheck className="w-5 h-5 text-[var(--success)] stroke-[1.75]" />,
      border: "border-[var(--success)]/30",
    },
    warning: {
      icon: <TriangleAlert className="w-5 h-5 text-[var(--warning)] stroke-[1.75]" />,
      border: "border-[var(--warning)]/30",
    },
    error: {
      icon: <CircleX className="w-5 h-5 text-[var(--danger)] stroke-[1.75]" />,
      border: "border-[var(--danger)]/30",
    },
    info: {
      icon: <Info className="w-5 h-5 text-[var(--primary)] stroke-[1.75]" />,
      border: "border-[var(--primary)]/30",
    },
  };

  const current = configs[type];

  return (
    <div
      role="alert"
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--surface)] border ${current.border} shadow-lg text-[var(--text)] text-sm animate-fade-in max-w-sm`}
    >
      <span className="shrink-0">{current.icon}</span>
      <p className="flex-1 font-medium">{message}</p>
      <button
        onClick={onClose}
        className="p-1 text-[var(--text-muted)] hover:text-[var(--text)] rounded transition-colors focus-ring"
        aria-label="Close alert"
      >
        <X className="w-4 h-4 stroke-[1.75]" />
      </button>
    </div>
  );
}
