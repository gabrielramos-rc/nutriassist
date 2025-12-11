import { createClient } from "@supabase/supabase-js";
import type {
  ChatSession,
  Message,
} from "@/types";

const CONTEXT_MESSAGE_LIMIT = 10;

// Create untyped admin client to avoid complex type inference issues
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/**
 * Get an existing active session or create a new one
 */
export async function getOrCreateSession(
  nutritionistId: string,
  patientId?: string | null,
  channel: "web" | "whatsapp" = "web"
): Promise<ChatSession> {
  const supabase = getSupabase();

  // Try to find an existing active session
  let query = supabase
    .from("chat_sessions")
    .select("*")
    .eq("nutritionist_id", nutritionistId)
    .eq("status", "active")
    .eq("channel", channel);

  if (patientId) {
    query = query.eq("patient_id", patientId);
  }

  const { data: existingSession } = await query.single();

  if (existingSession) {
    return existingSession as ChatSession;
  }

  // Create new session
  const { data: createdSession, error } = await supabase
    .from("chat_sessions")
    .insert({
      nutritionist_id: nutritionistId,
      patient_id: patientId ?? null,
      channel,
      status: "active",
      metadata: {},
    })
    .select()
    .single();

  if (error || !createdSession) {
    throw new Error(`Failed to create chat session: ${error?.message}`);
  }

  return createdSession as ChatSession;
}

/**
 * Get session by ID
 */
export async function getSession(sessionId: string): Promise<ChatSession | null> {
  const supabase = getSupabase();

  const { data } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  return data as ChatSession | null;
}

/**
 * Get the last N messages for a session (for context)
 */
export async function getSessionMessages(
  sessionId: string,
  limit: number = CONTEXT_MESSAGE_LIMIT
): Promise<Message[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }

  // Reverse to get chronological order
  return ((data || []) as Message[]).reverse();
}

/**
 * Save a message to the database
 */
export async function saveMessage(
  sessionId: string,
  sender: "patient" | "nina" | "nutritionist",
  content: string,
  intent?: string | null,
  metadata?: Record<string, unknown>
): Promise<Message> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("messages")
    .insert({
      chat_session_id: sessionId,
      sender,
      content,
      intent: intent ?? null,
      metadata: metadata || {},
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to save message: ${error?.message}`);
  }

  return data as Message;
}

/**
 * Close a chat session
 */
export async function closeSession(sessionId: string): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from("chat_sessions")
    .update({ status: "closed" })
    .eq("id", sessionId);

  if (error) {
    throw new Error(`Failed to close session: ${error.message}`);
  }
}

/**
 * Create a handoff record for escalation
 */
export async function createHandoff(
  sessionId: string,
  reason: string
): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase.from("handoffs").insert({
    chat_session_id: sessionId,
    reason,
    status: "pending",
  });

  if (error) {
    console.error("Failed to create handoff:", error);
  }
}

/**
 * Get pending handoffs for a nutritionist
 */
export async function getPendingHandoffs(nutritionistId: string) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("handoffs")
    .select(`
      *,
      chat_sessions!inner (
        id,
        nutritionist_id,
        patient_id,
        patients (
          id,
          name,
          email,
          phone
        )
      )
    `)
    .eq("chat_sessions.nutritionist_id", nutritionistId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching handoffs:", error);
    return [];
  }

  return data || [];
}

/**
 * Resolve a handoff
 */
export async function resolveHandoff(handoffId: string): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from("handoffs")
    .update({
      status: "resolved",
      resolved_at: new Date().toISOString(),
    })
    .eq("id", handoffId);

  if (error) {
    throw new Error(`Failed to resolve handoff: ${error.message}`);
  }
}

/**
 * Get a handoff by ID with full conversation context
 */
export async function getHandoffWithContext(handoffId: string) {
  const supabase = getSupabase();

  const { data: handoff, error: handoffError } = await supabase
    .from("handoffs")
    .select(`
      *,
      chat_sessions (
        id,
        nutritionist_id,
        patient_id,
        channel,
        status,
        created_at,
        patients (
          id,
          name,
          email,
          phone
        )
      )
    `)
    .eq("id", handoffId)
    .single();

  if (handoffError || !handoff) {
    return null;
  }

  // Get the last 20 messages for context
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_session_id", handoff.chat_sessions.id)
    .order("created_at", { ascending: true })
    .limit(20);

  return {
    ...handoff,
    messages: messages || [],
  };
}

/**
 * Check if a session has any pending handoffs
 */
export async function hasActiveHandoff(sessionId: string): Promise<boolean> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("handoffs")
    .select("id")
    .eq("chat_session_id", sessionId)
    .eq("status", "pending")
    .limit(1);

  if (error) {
    console.error("Error checking for active handoff:", error);
    return false;
  }

  return (data?.length || 0) > 0;
}

/**
 * Get handoff count for a nutritionist (for dashboard stats)
 */
export async function getHandoffCount(nutritionistId: string): Promise<number> {
  const supabase = getSupabase();

  const { count, error } = await supabase
    .from("handoffs")
    .select("id, chat_sessions!inner(nutritionist_id)", { count: "exact", head: true })
    .eq("chat_sessions.nutritionist_id", nutritionistId)
    .eq("status", "pending");

  if (error) {
    console.error("Error counting handoffs:", error);
    return 0;
  }

  return count || 0;
}

/**
 * Get active conversation count for a nutritionist
 */
export async function getActiveConversationCount(nutritionistId: string): Promise<number> {
  const supabase = getSupabase();

  const { count, error } = await supabase
    .from("chat_sessions")
    .select("id", { count: "exact", head: true })
    .eq("nutritionist_id", nutritionistId)
    .eq("status", "active");

  if (error) {
    console.error("Error counting conversations:", error);
    return 0;
  }

  return count || 0;
}

/**
 * Get all chat sessions for a nutritionist with patient info
 */
export async function getConversations(
  nutritionistId: string,
  options: {
    status?: "active" | "closed";
    limit?: number;
  } = {}
) {
  const supabase = getSupabase();

  let query = supabase
    .from("chat_sessions")
    .select(`
      *,
      patients (
        id,
        name,
        email,
        phone
      )
    `)
    .eq("nutritionist_id", nutritionistId)
    .order("updated_at", { ascending: false });

  if (options.status) {
    query = query.eq("status", options.status);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }

  return data || [];
}

/**
 * Get conversation with messages
 */
export async function getConversationWithMessages(sessionId: string, messageLimit: number = 50) {
  const supabase = getSupabase();

  const { data: session, error: sessionError } = await supabase
    .from("chat_sessions")
    .select(`
      *,
      patients (
        id,
        name,
        email,
        phone
      ),
      nutritionists (
        id,
        name
      )
    `)
    .eq("id", sessionId)
    .single();

  if (sessionError || !session) {
    return null;
  }

  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_session_id", sessionId)
    .order("created_at", { ascending: true })
    .limit(messageLimit);

  if (messagesError) {
    console.error("Error fetching messages:", messagesError);
    return { ...session, messages: [] };
  }

  // Check for pending handoffs
  const { data: handoffs } = await supabase
    .from("handoffs")
    .select("*")
    .eq("chat_session_id", sessionId)
    .eq("status", "pending");

  return {
    ...session,
    messages: messages || [],
    pendingHandoffs: handoffs || [],
  };
}
