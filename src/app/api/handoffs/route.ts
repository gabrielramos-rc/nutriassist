import { NextRequest, NextResponse } from "next/server";
import { getPendingHandoffs, resolveHandoff } from "@/services/conversations";

// GET /api/handoffs - Get pending handoffs for a nutritionist
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const nutritionistId = searchParams.get("nutritionistId");

  if (!nutritionistId) {
    return NextResponse.json(
      { error: "nutritionistId é obrigatório" },
      { status: 400 }
    );
  }

  const handoffs = await getPendingHandoffs(nutritionistId);
  return NextResponse.json(handoffs);
}

// PATCH /api/handoffs - Resolve a handoff
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { handoffId } = body;

    if (!handoffId) {
      return NextResponse.json(
        { error: "handoffId é obrigatório" },
        { status: 400 }
      );
    }

    await resolveHandoff(handoffId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error resolving handoff:", error);
    return NextResponse.json(
      { error: "Erro ao resolver handoff" },
      { status: 500 }
    );
  }
}
