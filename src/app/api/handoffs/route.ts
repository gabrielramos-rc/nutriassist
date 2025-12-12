import { NextRequest, NextResponse } from "next/server";
import { getPendingHandoffs, resolveHandoff } from "@/services/conversations";
import { handoffGetSchema, handoffUpdateSchema, getValidationError } from "@/lib/validations";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

// GET /api/handoffs - Get pending handoffs for a nutritionist
export async function GET(request: NextRequest) {
  const rateLimit = checkRateLimit(request, "api");
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetIn);
  }

  const searchParams = request.nextUrl.searchParams;
  const params = {
    nutritionistId: searchParams.get("nutritionistId") || "",
  };

  const validation = handoffGetSchema.safeParse(params);
  if (!validation.success) {
    return NextResponse.json({ error: getValidationError(validation.error) }, { status: 400 });
  }

  const handoffs = await getPendingHandoffs(validation.data.nutritionistId);
  return NextResponse.json(handoffs);
}

// PATCH /api/handoffs - Resolve a handoff
export async function PATCH(request: NextRequest) {
  const rateLimit = checkRateLimit(request, "api");
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetIn);
  }

  try {
    const body = await request.json();

    const validation = handoffUpdateSchema.safeParse({
      handoffId: body.handoffId,
      status: "resolved", // Always resolve when using this endpoint
    });
    if (!validation.success) {
      return NextResponse.json({ error: getValidationError(validation.error) }, { status: 400 });
    }

    await resolveHandoff(validation.data.handoffId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao resolver handoff" }, { status: 500 });
  }
}
