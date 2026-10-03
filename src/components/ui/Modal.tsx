import React, { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  confirmText?: string;
  onConfirm?: () => void;
  confirmVariant?: "primary" | "danger";
  isConfirmLoading?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  confirmText,
  onConfirm,
  confirmVariant = "primary",
  isConfirmLoading = false,
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-md rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xl p-6 flex flex-col gap-4 text-[var(--text)] relative"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
            {description && (
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors focus-ring"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 stroke-[1.75]" />
          </button>
        </div>

        {children && <div className="py-2">{children}</div>}

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--border)]">
          <Button variant="ghost" size="md" onClick={onClose} disabled={isConfirmLoading}>
            Cancel
          </Button>
          {confirmText && onConfirm && (
            <Button
              variant={confirmVariant}
              size="md"
              onClick={onConfirm}
              isLoading={isConfirmLoading}
            >
              {confirmText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
