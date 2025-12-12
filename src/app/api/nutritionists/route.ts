import { NextRequest, NextResponse } from "next/server";
import { getNutritionist, updateNutritionist } from "@/services/patients";
import {
  nutritionistGetSchema,
  nutritionistUpdateSchema,
  getValidationError,
} from "@/lib/validations";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

// GET /api/nutritionists - Get nutritionist by ID
export async function GET(request: NextRequest) {
  const rateLimit = checkRateLimit(request, "api");
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetIn);
  }

  const searchParams = request.nextUrl.searchParams;
  const params = {
    nutritionistId: searchParams.get("nutritionistId") || "",
  };

  const validation = nutritionistGetSchema.safeParse(params);
  if (!validation.success) {
    return NextResponse.json({ error: getValidationError(validation.error) }, { status: 400 });
  }

  const nutritionist = await getNutritionist(validation.data.nutritionistId);

  if (!nutritionist) {
    return NextResponse.json({ error: "Nutricionista não encontrado" }, { status: 404 });
  }

  return NextResponse.json(nutritionist);
}

// PATCH /api/nutritionists - Update nutritionist settings
export async function PATCH(request: NextRequest) {
  const rateLimit = checkRateLimit(request, "api");
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetIn);
  }

  try {
    const body = await request.json();

    const validation = nutritionistUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: getValidationError(validation.error) }, { status: 400 });
    }

    const {
      nutritionistId,
      name,
      email,
      phone,
      business_hours,
      appointment_duration,
      faq_responses,
    } = validation.data;

    const nutritionist = await updateNutritionist(nutritionistId, {
      name,
      email,
      phone,
      business_hours,
      appointment_duration,
      faq_responses,
    });

    return NextResponse.json(nutritionist);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar configurações" }, { status: 500 });
  }
}
