"use client";

import { useState, useRef, useEffect } from "react";
import { cn, formatDateTime } from "@/lib/utils";
import { Send, AlertCircle, CheckCircle, User, Bot, ArrowLeft } from "lucide-react";

interface Message {
  id: string;
  sender: "patient" | "nina" | "nutritionist";
  content: string;
  created_at: string;
  intent?: string | null;
}

interface Handoff {
  id: string;
  reason: string;
  status: string;
  created_at: string;
}

interface ConversationViewProps {
  sessionId: string;
  patientName: string;
  messages: Message[];
  pendingHandoffs: Handoff[];
  onSendMessage: (message: string) => Promise<void>;
  onResolveHandoff: (handoffId: string) => Promise<void>;
  onBack?: () => void;
}

export function ConversationView({
  sessionId: _sessionId,
  patientName,
  messages,
  pendingHandoffs,
  onSendMessage,
  onResolveHandoff,
  onBack,
}: ConversationViewProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      await onSendMessage(newMessage.trim());
      setNewMessage("");
    } finally {
      setIsSending(false);
    }
  };

  const getSenderInfo = (sender: string) => {
    switch (sender) {
      case "patient":
        return {
          name: patientName,
          icon: User,
          bgColor: "bg-gray-100",
          textColor: "text-gray-700",
          align: "items-start",
        };
      case "nina":
        return {
          name: "Nina",
          icon: Bot,
          bgColor: "bg-green-100",
          textColor: "text-green-700",
          align: "items-start",
        };
      case "nutritionist":
        return {
          name: "Você",
          icon: User,
          bgColor: "bg-blue-100",
          textColor: "text-blue-700",
          align: "items-end",
        };
      default:
        return {
          name: "Desconhecido",
          icon: User,
          bgColor: "bg-gray-100",
          textColor: "text-gray-600",
          align: "items-start",
        };
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile back button */}
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 -ml-2 hover:bg-gray-100 rounded-lg md:hidden"
                aria-label="Voltar para lista"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-700 font-medium">
                {patientName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{patientName}</h2>
              <p className="text-sm text-gray-500">Conversa ativa</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending handoffs alert */}
      {pendingHandoffs.length > 0 && (
        <div className="p-4 bg-orange-50 border-b border-orange-100">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-orange-800">Aguardando sua resposta</p>
              {pendingHandoffs.map((handoff) => (
                <div
                  key={handoff.id}
                  className="mt-2 p-3 bg-white rounded-lg border border-orange-200"
                >
                  <p className="text-sm text-gray-700">{handoff.reason}</p>
                  <button
                    onClick={() => onResolveHandoff(handoff.id)}
                    className="mt-2 flex items-center gap-1 text-sm text-green-600 hover:text-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Marcar como respondido
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const sender = getSenderInfo(msg.sender);
          const isNutritionist = msg.sender === "nutritionist";

          return (
            <div
              key={msg.id}
              className={cn("flex flex-col", isNutritionist ? "items-end" : "items-start")}
            >
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2",
                  isNutritionist
                    ? "bg-blue-600 text-white"
                    : msg.sender === "nina"
                      ? "bg-green-100 text-gray-900"
                      : "bg-gray-100 text-gray-900"
                )}
              >
                {!isNutritionist && (
                  <p
                    className={cn(
                      "text-xs font-medium mb-1",
                      msg.sender === "nina" ? "text-green-700" : "text-gray-500"
                    )}
                  >
                    {sender.name}
                  </p>
                )}
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
              <span className="text-xs text-gray-400 mt-1 px-1">
                {formatDateTime(msg.created_at)}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua resposta..."
            disabled={isSending}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Enviar
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Sua resposta será enviada diretamente ao paciente (não passa pela Nina)
        </p>
      </form>
    </div>
  );
}
