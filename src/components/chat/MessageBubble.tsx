"use client";

import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils";

interface MessageBubbleProps {
  content: string;
  sender: "patient" | "nina" | "nutritionist";
  timestamp: Date;
  isTyping?: boolean;
}

export function MessageBubble({
  content,
  sender,
  timestamp,
  isTyping = false,
}: MessageBubbleProps) {
  const isPatient = sender === "patient";

  return (
    <div
      className={cn(
        "flex w-full mb-3",
        isPatient ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5",
          isPatient
            ? "bg-green-600 text-white rounded-br-md"
            : "bg-gray-100 text-gray-900 rounded-bl-md"
        )}
      >
        {isTyping ? (
          <TypingIndicator />
        ) : (
          <>
            <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
            <p
              className={cn(
                "text-xs mt-1",
                isPatient ? "text-green-100" : "text-gray-500"
              )}
            >
              {formatTime(timestamp)}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1 py-1">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
  );
}
