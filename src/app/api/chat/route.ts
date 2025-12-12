import { NextRequest, NextResponse } from "next/server";
import { processMessage } from "@/services/nina";
import {
  getOrCreateSession,
  getSession,
  getSessionMessages,
  saveMessage,
  createHandoff,
} from "@/services/conversations";
import { getNutritionist, getPatient } from "@/services/patients";
import { chatRequestSchema, getValidationError } from "@/lib/validations";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import type { ChatResponse } from "@/types";

export async function POST(request: NextRequest) {
  // Check rate limit
  const rateLimit = checkRateLimit(request, "chat");
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetIn);
  }

  try {
    const body = await request.json();

    // Validate request with Zod
    const validation = chatRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: getValidationError(validation.error) }, { status: 400 });
    }

    const { message, nutritionistId, patientId, sessionId } = validation.data;

    // Require either nutritionistId or sessionId
    if (!nutritionistId && !sessionId) {
      return NextResponse.json(
        { error: "Either nutritionistId or sessionId is required" },
        { status: 400 }
      );
    }

    // Get or create session
    let session;
    let resolvedNutritionistId: string;

    if (sessionId) {
      session = await getSession(sessionId);
      if (!session) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }
      resolvedNutritionistId = session.nutritionist_id;
    } else {
      resolvedNutritionistId = nutritionistId!;
      session = await getOrCreateSession(resolvedNutritionistId, patientId || null);
    }

    // Load nutritionist
    const nutritionist = await getNutritionist(resolvedNutritionistId);
    if (!nutritionist) {
      return NextResponse.json({ error: "Nutritionist not found" }, { status: 404 });
    }

    // Load patient if available
    const patient = session.patient_id ? await getPatient(session.patient_id) : null;

    // Load conversation history
    const conversationHistory = await getSessionMessages(session.id);

    // Save user message first
    await saveMessage(session.id, "patient", message);

    // Process through Nina
    const ninaResponse = await processMessage(message, {
      nutritionist,
      patient,
      conversationHistory,
    });

    // Save Nina's response
    await saveMessage(
      session.id,
      "nina",
      ninaResponse.content,
      ninaResponse.intent,
      ninaResponse.metadata as Record<string, unknown>
    );

    // Create handoff if needed
    if (ninaResponse.metadata?.requiresHandoff) {
      await createHandoff(session.id, ninaResponse.metadata.handoffReason || "unknown");
    }

    // Return response
    const response: ChatResponse = {
      response: ninaResponse,
      sessionId: session.id,
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
