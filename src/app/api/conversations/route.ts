import { NextRequest, NextResponse } from "next/server";
import {
  getConversations,
  getConversationWithMessages,
  saveMessage,
} from "@/services/conversations";

// GET /api/conversations - List conversations for a nutritionist
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const nutritionistId = searchParams.get("nutritionistId");
  const sessionId = searchParams.get("sessionId");

  if (sessionId) {
    // Get single conversation with messages
    const conversation = await getConversationWithMessages(sessionId);

    if (!conversation) {
      return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 });
    }

    return NextResponse.json(conversation);
  }

  if (!nutritionistId) {
    return NextResponse.json({ error: "nutritionistId é obrigatório" }, { status: 400 });
  }

  const status = searchParams.get("status") as "active" | "closed" | null;
  const limit = searchParams.get("limit");

  const conversations = await getConversations(nutritionistId, {
    status: status || undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
  });

  return NextResponse.json(conversations);
}

// POST /api/conversations - Send a message as nutritionist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, content } = body;

    if (!sessionId || !content) {
      return NextResponse.json({ error: "sessionId e content são obrigatórios" }, { status: 400 });
    }

    const message = await saveMessage(sessionId, "nutritionist", content, null, {
      sentFromDashboard: true,
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Erro ao enviar mensagem" }, { status: 500 });
  }
}
