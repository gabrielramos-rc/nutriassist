"use client";

import { useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
}

const FOCUSABLE_SELECTORS =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  showCloseButton = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      // Focus trap
      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(FOCUSABLE_SELECTORS);
        const firstElement = focusableElements[0] as HTMLElement | undefined;
        const lastElement = focusableElements[focusableElements.length - 1] as
          | HTMLElement
          | undefined;

        if (!firstElement || !lastElement) return;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      // Store currently focused element to restore later
      previousActiveElement.current = document.activeElement as HTMLElement;

      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";

      // Focus first focusable element in modal
      setTimeout(() => {
        if (modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll(FOCUSABLE_SELECTORS);
          const firstElement = focusableElements[0] as HTMLElement | undefined;
          firstElement?.focus();
        }
      }, 0);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";

      // Restore focus to previous element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-[calc(100vw-2rem)] sm:max-w-sm",
    md: "max-w-[calc(100vw-2rem)] sm:max-w-md",
    lg: "max-w-[calc(100vw-2rem)] sm:max-w-lg",
    xl: "max-w-[calc(100vw-2rem)] sm:max-w-xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={cn(
          "relative bg-white rounded-xl shadow-xl w-full mx-4 max-h-[90vh] overflow-auto",
          sizes[size]
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-3 sm:p-4 border-b border-gray-200">
            <div>
              {title && (
                <h2 id="modal-title" className="text-base sm:text-lg font-semibold text-gray-900">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-xs sm:text-sm text-gray-500 mt-1">{description}</p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors -mr-2 -mt-2"
                aria-label="Fechar"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-3 sm:p-4">{children}</div>
      </div>
    </div>
  );
}

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div
      className={cn(
        "flex justify-end gap-3 pt-4 border-t border-gray-200 -mx-4 -mb-4 px-4 py-4 bg-gray-50 rounded-b-xl",
        className
      )}
    >
      {children}
    </div>
  );
}
