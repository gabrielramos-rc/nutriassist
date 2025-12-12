"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { QuickReplies, QuickReplyOption } from "./QuickReplies";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import type { ChatMessage, ChatResponse } from "@/types";

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
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const [quickReplies, setQuickReplies] = useState<QuickReplyOption[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabaseRef = useRef(createClient());
  const toast = useToast();

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

  // Subscribe to real-time messages (for nutritionist replies)
  useEffect(() => {
    if (!sessionId) return;

    const supabase = supabaseRef.current;
    const channelName = `chat:session:${sessionId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_session_id=eq.${sessionId}`,
        },
        (payload) => {
          const newMessage = payload.new as {
            id: string;
            sender: string;
            content: string;
            created_at: string;
            intent?: string | null;
          };

          // Only add nutritionist messages (patient/nina already added locally)
          if (newMessage.sender === "nutritionist") {
            const chatMessage: ChatMessage = {
              id: newMessage.id,
              sender: "nutritionist",
              content: newMessage.content,
              timestamp: new Date(newMessage.created_at),
            };

            setMessages((prev) => {
              // Avoid duplicates
              const exists = prev.some((m) => m.id === newMessage.id);
              if (exists) return prev;
              return [...prev, chatMessage];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

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
    setLastFailedMessage(null);
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
        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get("Retry-After") || "60";
          throw new Error(`Muitas mensagens. Aguarde ${retryAfter} segundos.`);
        }
        // Try to get error message from response
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao enviar mensagem. Tente novamente.");
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
      // Determine error message
      let errorMsg = "Desculpe, ocorreu um erro. Tente novamente.";
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        errorMsg = "Sem conexao com a internet. Verifique sua conexao e tente novamente.";
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }

      // Store failed message for retry
      setLastFailedMessage(content);
      setError(errorMsg);
      toast.error(errorMsg);

      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: "nina",
        content:
          "Desculpe, tive um probleminha aqui. Voce pode clicar em 'Tentar novamente' abaixo.",
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
        <p className="text-sm text-green-100">Assistente da {nutritionistName}</p>
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
        {isLoading && <MessageBubble content="" sender="nina" timestamp={new Date()} isTyping />}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick replies */}
      <QuickReplies options={quickReplies} onSelect={handleQuickReply} disabled={isLoading} />

      {/* Error message with retry */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-100 flex items-center justify-between">
          <span className="text-red-600 text-sm">{error}</span>
          {lastFailedMessage && (
            <button
              onClick={() => {
                setError(null);
                sendMessage(lastFailedMessage);
                setLastFailedMessage(null);
              }}
              className="text-sm text-red-600 hover:text-red-700 font-medium underline ml-2"
            >
              Tentar novamente
            </button>
          )}
        </div>
      )}

      {/* Input */}
      <MessageInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}
