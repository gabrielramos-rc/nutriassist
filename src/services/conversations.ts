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
