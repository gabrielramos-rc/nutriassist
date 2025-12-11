"use client";

import { useState } from "react";
import { cn, formatDateTime, truncate } from "@/lib/utils";
import { MessageSquare, AlertCircle } from "lucide-react";

interface Conversation {
  id: string;
  status: string;
  channel: string;
  updated_at: string;
  patients: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  } | null;
  hasPendingHandoff?: boolean;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: ConversationListProps) {
  const [filter, setFilter] = useState<"all" | "active" | "pending">("all");

  const filteredConversations = conversations.filter((conv) => {
    if (filter === "active") return conv.status === "active";
    if (filter === "pending") return conv.hasPendingHandoff;
    return true;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Filter tabs */}
      <div className="flex gap-2 p-4 border-b border-gray-200">
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
            filter === "all"
              ? "bg-green-100 text-green-700"
              : "text-gray-600 hover:bg-gray-100"
          )}
        >
          Todas
        </button>
        <button
          onClick={() => setFilter("active")}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
            filter === "active"
              ? "bg-green-100 text-green-700"
              : "text-gray-600 hover:bg-gray-100"
          )}
        >
          Ativas
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1",
            filter === "pending"
              ? "bg-orange-100 text-orange-700"
              : "text-gray-600 hover:bg-gray-100"
          )}
        >
          <AlertCircle className="w-4 h-4" />
          Pendentes
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">
              Nenhuma conversa encontrada
            </p>
          </div>
        ) : (
          <ul>
            {filteredConversations.map((conv) => (
              <li key={conv.id}>
                <button
                  onClick={() => onSelect(conv.id)}
                  className={cn(
                    "w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors",
                    selectedId === conv.id && "bg-green-50 border-l-2 border-l-green-600"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-green-700 font-medium">
                          {(conv.patients?.name || "P").charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 truncate">
                            {conv.patients?.name || "Paciente"}
                          </p>
                          {conv.hasPendingHandoff && (
                            <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {conv.channel === "web" ? "Chat Web" : "WhatsApp"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-gray-400">
                        {formatDateTime(conv.updated_at)}
                      </span>
                      <span
                        className={cn(
                          "px-2 py-0.5 text-xs font-medium rounded-full",
                          conv.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        )}
                      >
                        {conv.status === "active" ? "Ativa" : "Fechada"}
                      </span>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
