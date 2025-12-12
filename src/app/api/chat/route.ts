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
import type { ChatRequest, ChatResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();

    // Validate request
    if (!body.message || typeof body.message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (!body.nutritionistId && !body.sessionId) {
      return NextResponse.json(
        { error: "Either nutritionistId or sessionId is required" },
        { status: 400 }
      );
    }

    // Get or create session
    let session;
    let nutritionistId: string;

    if (body.sessionId) {
      session = await getSession(body.sessionId);
      if (!session) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }
      nutritionistId = session.nutritionist_id;
    } else {
      nutritionistId = body.nutritionistId!;
      session = await getOrCreateSession(nutritionistId, body.patientId || null);
    }

    // Load nutritionist
    const nutritionist = await getNutritionist(nutritionistId);
    if (!nutritionist) {
      return NextResponse.json({ error: "Nutritionist not found" }, { status: 404 });
    }

    // Load patient if available
    const patient = session.patient_id ? await getPatient(session.patient_id) : null;

    // Load conversation history
    const conversationHistory = await getSessionMessages(session.id);

    // Save user message first
    await saveMessage(session.id, "patient", body.message.trim());

    // Process through Nina
    const ninaResponse = await processMessage(body.message.trim(), {
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
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
