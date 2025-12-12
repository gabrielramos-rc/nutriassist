"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSend,
  disabled = false,
  placeholder = "Digite sua mensagem...",
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = () => {
    const trimmed = message.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex items-end gap-2 p-3 border-t bg-white">
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        aria-label="Mensagem"
        className={cn(
          "flex-1 resize-none rounded-2xl border border-gray-300 px-4 py-2.5",
          "text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
          "disabled:bg-gray-100 disabled:cursor-not-allowed",
          "max-h-[120px]"
        )}
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || !message.trim()}
        aria-label="Enviar mensagem"
        className={cn(
          "p-2.5 rounded-full transition-colors",
          "bg-green-600 text-white hover:bg-green-700",
          "disabled:bg-gray-300 disabled:cursor-not-allowed"
        )}
      >
        <Send className="w-5 h-5" aria-hidden="true" />
      </button>
    </div>
  );
}
