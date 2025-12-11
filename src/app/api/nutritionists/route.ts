import { NextRequest, NextResponse } from "next/server";
import { getNutritionist, updateNutritionist } from "@/services/patients";

// GET /api/nutritionists - Get nutritionist by ID
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const nutritionistId = searchParams.get("nutritionistId");

  if (!nutritionistId) {
    return NextResponse.json(
      { error: "nutritionistId é obrigatório" },
      { status: 400 }
    );
  }

  const nutritionist = await getNutritionist(nutritionistId);

  if (!nutritionist) {
    return NextResponse.json(
      { error: "Nutricionista não encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json(nutritionist);
}

// PATCH /api/nutritionists - Update nutritionist settings
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      nutritionistId,
      name,
      email,
      phone,
      business_hours,
      appointment_duration,
      faq_responses,
    } = body;

    if (!nutritionistId) {
      return NextResponse.json(
        { error: "nutritionistId é obrigatório" },
        { status: 400 }
      );
    }

    const nutritionist = await updateNutritionist(nutritionistId, {
      name,
      email,
      phone,
      business_hours,
      appointment_duration,
      faq_responses,
    });

    return NextResponse.json(nutritionist);
  } catch (error) {
    console.error("Error updating nutritionist:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar configurações" },
      { status: 500 }
    );
  }
}
