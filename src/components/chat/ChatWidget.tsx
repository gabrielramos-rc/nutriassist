"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { QuickReplies, QuickReplyOption } from "./QuickReplies";
import type { ChatMessage, ChatResponse, NinaResponse } from "@/types";

interface ChatWidgetProps {
  nutritionistId: string;
  nutritionistName: string;
  patientId?: string;
  initialGreeting?: string;
}

export function ChatWidget({
  nutritionistId,
  nutritionistName,
  patientId,
  initialGreeting,
}: ChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quickReplies, setQuickReplies] = useState<QuickReplyOption[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Show initial greeting
  useEffect(() => {
    if (initialGreeting && messages.length === 0) {
      setMessages([
        {
          id: "greeting",
          sender: "nina",
          content: initialGreeting,
          timestamp: new Date(),
        },
      ]);
    }
  }, [initialGreeting, messages.length]);

  const sendMessage = async (content: string) => {
    // Add user message immediately
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "patient",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    setQuickReplies([]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          nutritionistId,
          sessionId,
          patientId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data: ChatResponse = await response.json();

      // Update session ID
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }

      // Add Nina's response
      const ninaMessage: ChatMessage = {
        id: `nina-${Date.now()}`,
        sender: "nina",
        content: data.response.content,
        timestamp: new Date(),
        intent: data.response.intent,
      };
      setMessages((prev) => [...prev, ninaMessage]);

      // Set quick replies if available
      if (data.response.metadata?.availableSlots) {
        const slots = data.response.metadata.availableSlots;
        setQuickReplies(
          slots.map((slot, index) => ({
            label: slot.formatted,
            value: String(index + 1), // Send "1", "2", "3"... as Nina expects
          }))
        );
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Desculpe, ocorreu um erro. Tente novamente.");

      // Add error message
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: "nina",
        content: "Desculpe, tive um probleminha aqui. Pode tentar novamente em alguns segundos?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickReply = (option: string) => {
    sendMessage(option);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-green-600 text-white px-4 py-3">
        <h2 className="font-semibold">Nina</h2>
        <p className="text-sm text-green-100">
          Assistente da {nutritionistName}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            content={message.content}
            sender={message.sender}
            timestamp={message.timestamp}
          />
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <MessageBubble
            content=""
            sender="nina"
            timestamp={new Date()}
            isTyping
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick replies */}
      <QuickReplies
        options={quickReplies}
        onSelect={handleQuickReply}
        disabled={isLoading}
      />

      {/* Error message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Input */}
      <MessageInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}
