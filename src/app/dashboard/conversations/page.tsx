"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ConversationList } from "@/components/dashboard/ConversationList";
import { ConversationView } from "@/components/dashboard/ConversationView";
import { MessageSquare, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";

const TEST_NUTRITIONIST_ID = "11111111-1111-1111-1111-111111111111";

interface Patient {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

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

interface Conversation {
  id: string;
  status: string;
  channel: string;
  updated_at: string;
  patients: Patient | null;
  hasPendingHandoff?: boolean;
}

interface ConversationDetail extends Conversation {
  messages: Message[];
  pendingHandoffs: Handoff[];
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<ConversationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const supabaseRef = useRef(createClient());
  const toast = useToast();

  // Fetch conversations list
  const fetchConversations = useCallback(async () => {
    setError(null);
    try {
      const [conversationsRes, handoffsRes] = await Promise.all([
        fetch(`/api/conversations?nutritionistId=${TEST_NUTRITIONIST_ID}`),
        fetch(`/api/handoffs?nutritionistId=${TEST_NUTRITIONIST_ID}`),
      ]);

      if (!conversationsRes.ok || !handoffsRes.ok) {
        throw new Error("Erro ao carregar conversas");
      }

      const conversationsData = await conversationsRes.json();
      const handoffsData = await handoffsRes.json();

      // Mark conversations with pending handoffs
      const handoffSessionIds = new Set(
        handoffsData.map((h: { chat_sessions: { id: string } }) => h.chat_sessions?.id)
      );

      const enrichedConversations = conversationsData.map((conv: Conversation) => ({
        ...conv,
        hasPendingHandoff: handoffSessionIds.has(conv.id),
      }));

      setConversations(enrichedConversations);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar conversas";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch conversation detail
  const fetchConversationDetail = useCallback(
    async (sessionId: string) => {
      setIsLoadingDetail(true);
      try {
        const res = await fetch(`/api/conversations?sessionId=${sessionId}`);
        if (!res.ok) {
          throw new Error("Erro ao carregar conversa");
        }
        const data = await res.json();
        setSelectedConversation(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao carregar conversa";
        toast.error(message);
      } finally {
        setIsLoadingDetail(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (selectedId) {
      fetchConversationDetail(selectedId);
    }
  }, [selectedId, fetchConversationDetail]);

  // Subscribe to real-time messages for the selected conversation
  useEffect(() => {
    if (!selectedId) return;

    const supabase = supabaseRef.current;
    const channelName = `messages:session:${selectedId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_session_id=eq.${selectedId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setSelectedConversation((prev) => {
            if (!prev) return null;
            // Avoid duplicates (in case message was already added optimistically)
            const exists = prev.messages.some((m) => m.id === newMessage.id);
            if (exists) return prev;
            return {
              ...prev,
              messages: [...prev.messages, newMessage],
            };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedId]);

  // Handle sending message
  const handleSendMessage = async (message: string) => {
    if (!selectedId) return;

    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: selectedId,
          content: message,
        }),
      });
      if (!res.ok) {
        throw new Error("Erro ao enviar mensagem");
      }
      // Message will appear via Realtime subscription
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro ao enviar mensagem";
      toast.error(errorMsg);
    }
  };

  // Handle resolving handoff
  const handleResolveHandoff = async (handoffId: string) => {
    try {
      const res = await fetch("/api/handoffs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handoffId }),
      });

      if (!res.ok) {
        throw new Error("Erro ao resolver handoff");
      }

      // Refresh both list and detail
      await Promise.all([fetchConversations(), selectedId && fetchConversationDetail(selectedId)]);
      toast.success("Handoff resolvido!");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro ao resolver handoff";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Conversas</h1>
        <p className="text-gray-500 mt-1">Gerencie as conversas com seus pacientes</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-[calc(100%-5rem)] flex">
        {/* Conversation list - hidden on mobile when conversation selected */}
        <div
          className={cn(
            "w-full md:w-80 border-r border-gray-200 flex-shrink-0",
            selectedId ? "hidden md:block" : "block"
          )}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
              <p className="text-gray-900 font-medium text-sm mb-2">Erro ao carregar</p>
              <p className="text-gray-500 text-xs mb-3">{error}</p>
              <button
                onClick={() => {
                  setIsLoading(true);
                  fetchConversations();
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Tentar novamente
              </button>
            </div>
          ) : (
            <ConversationList
              conversations={conversations}
              selectedId={selectedId || undefined}
              onSelect={setSelectedId}
            />
          )}
        </div>

        {/* Conversation detail - hidden on mobile when no conversation selected */}
        <div className={cn("flex-1", !selectedId ? "hidden md:block" : "block")}>
          {isLoadingDetail ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
            </div>
          ) : selectedConversation ? (
            <ConversationView
              sessionId={selectedConversation.id}
              patientName={selectedConversation.patients?.name || "Paciente"}
              messages={selectedConversation.messages}
              pendingHandoffs={selectedConversation.pendingHandoffs}
              onSendMessage={handleSendMessage}
              onResolveHandoff={handleResolveHandoff}
              onBack={() => {
                setSelectedId(null);
                setSelectedConversation(null);
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione uma conversa</h3>
              <p className="text-gray-500 text-sm">
                Escolha uma conversa na lista ao lado para ver os detalhes e responder
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
