"use client";

import { cn } from "@/lib/utils";

export interface QuickReplyOption {
  label: string;
  value: string;
}

interface QuickRepliesProps {
  options: QuickReplyOption[];
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export function QuickReplies({ options, onSelect, disabled = false }: QuickRepliesProps) {
  if (options.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 px-4 py-2">
      {options.map((option, index) => (
        <button
          key={index}
          onClick={() => onSelect(option.value)}
          disabled={disabled}
          className={cn(
            "px-3 py-1.5 text-sm rounded-full border border-green-600 text-green-600",
            "hover:bg-green-50 transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
