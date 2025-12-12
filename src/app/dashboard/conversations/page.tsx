"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ConversationList } from "@/components/dashboard/ConversationList";
import { ConversationView } from "@/components/dashboard/ConversationView";
import { MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const supabaseRef = useRef(createClient());

  // Fetch conversations list
  const fetchConversations = useCallback(async () => {
    try {
      const [conversationsRes, handoffsRes] = await Promise.all([
        fetch(`/api/conversations?nutritionistId=${TEST_NUTRITIONIST_ID}`),
        fetch(`/api/handoffs?nutritionistId=${TEST_NUTRITIONIST_ID}`),
      ]);

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
    } catch {
      // Failed to fetch conversations
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch conversation detail
  const fetchConversationDetail = useCallback(async (sessionId: string) => {
    setIsLoadingDetail(true);
    try {
      const res = await fetch(`/api/conversations?sessionId=${sessionId}`);
      const data = await res.json();
      setSelectedConversation(data);
    } catch {
      // Failed to fetch conversation
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

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
      await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: selectedId,
          content: message,
        }),
      });
      // Message will appear via Realtime subscription
    } catch {
      // Failed to send message
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

      if (res.ok) {
        // Refresh both list and detail
        await Promise.all([
          fetchConversations(),
          selectedId && fetchConversationDetail(selectedId),
        ]);
      }
    } catch {
      // Failed to resolve handoff
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Conversas</h1>
        <p className="text-gray-500 mt-1">Gerencie as conversas com seus pacientes</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-[calc(100%-5rem)] flex">
        {/* Conversation list */}
        <div className="w-80 border-r border-gray-200 flex-shrink-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
            </div>
          ) : (
            <ConversationList
              conversations={conversations}
              selectedId={selectedId || undefined}
              onSelect={setSelectedId}
            />
          )}
        </div>

        {/* Conversation detail */}
        <div className="flex-1">
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
