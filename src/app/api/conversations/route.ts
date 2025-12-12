import { NextRequest, NextResponse } from "next/server";
import {
  getConversations,
  getConversationWithMessages,
  saveMessage,
} from "@/services/conversations";
import {
  conversationGetSchema,
  conversationReplySchema,
  getValidationError,
} from "@/lib/validations";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

// GET /api/conversations - List conversations for a nutritionist
export async function GET(request: NextRequest) {
  const rateLimit = checkRateLimit(request, "api");
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetIn);
  }

  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get("sessionId");

  // If sessionId is provided, get single conversation with messages
  if (sessionId) {
    const conversation = await getConversationWithMessages(sessionId);

    if (!conversation) {
      return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 });
    }

    return NextResponse.json(conversation);
  }

  // Otherwise, list conversations for nutritionist
  const params = {
    nutritionistId: searchParams.get("nutritionistId") || "",
    sessionId: sessionId || undefined,
  };

  const validation = conversationGetSchema.safeParse(params);
  if (!validation.success) {
    return NextResponse.json({ error: getValidationError(validation.error) }, { status: 400 });
  }

  const status = searchParams.get("status") as "active" | "closed" | null;
  const limit = searchParams.get("limit");

  const conversations = await getConversations(validation.data.nutritionistId, {
    status: status || undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
  });

  return NextResponse.json(conversations);
}

// POST /api/conversations - Send a message as nutritionist
export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, "api");
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetIn);
  }

  try {
    const body = await request.json();

    // Map 'content' to 'message' for validation
    const validationData = {
      sessionId: body.sessionId,
      message: body.content,
    };

    const validation = conversationReplySchema.safeParse(validationData);
    if (!validation.success) {
      return NextResponse.json({ error: getValidationError(validation.error) }, { status: 400 });
    }

    const message = await saveMessage(
      validation.data.sessionId,
      "nutritionist",
      validation.data.message,
      null,
      {
        sentFromDashboard: true,
      }
    );

    return NextResponse.json(message);
  } catch {
    return NextResponse.json({ error: "Erro ao enviar mensagem" }, { status: 500 });
  }
}
