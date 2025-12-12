import { NextRequest, NextResponse } from "next/server";
import {
  getPatientsByNutritionist,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
} from "@/services/patients";
import {
  patientGetSchema,
  patientCreateSchema,
  patientUpdateSchema,
  patientDeleteSchema,
  getValidationError,
} from "@/lib/validations";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

// GET /api/patients - List patients for a nutritionist or get a single patient
export async function GET(request: NextRequest) {
  const rateLimit = checkRateLimit(request, "api");
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetIn);
  }

  const searchParams = request.nextUrl.searchParams;
  const patientId = searchParams.get("patientId");

  // If patientId is provided, get single patient (no nutritionistId required)
  if (patientId) {
    const patient = await getPatient(patientId);
    if (!patient) {
      return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 });
    }
    return NextResponse.json(patient);
  }

  // Otherwise, list patients for nutritionist
  const params = {
    nutritionistId: searchParams.get("nutritionistId") || "",
    patientId: patientId || undefined,
  };

  const validation = patientGetSchema.safeParse(params);
  if (!validation.success) {
    return NextResponse.json({ error: getValidationError(validation.error) }, { status: 400 });
  }

  const patients = await getPatientsByNutritionist(validation.data.nutritionistId);
  return NextResponse.json(patients);
}

// POST /api/patients - Create a new patient
export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, "api");
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetIn);
  }

  try {
    const body = await request.json();

    const validation = patientCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: getValidationError(validation.error) }, { status: 400 });
    }

    const { nutritionistId, name, email, phone } = validation.data;
    const patient = await createPatient(nutritionistId, name, email || undefined, phone);
    return NextResponse.json(patient, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar paciente" }, { status: 500 });
  }
}

// PATCH /api/patients - Update a patient
export async function PATCH(request: NextRequest) {
  const rateLimit = checkRateLimit(request, "api");
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetIn);
  }

  try {
    const body = await request.json();

    const validation = patientUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: getValidationError(validation.error) }, { status: 400 });
    }

    const { patientId, name, email, phone } = validation.data;
    const patient = await updatePatient(patientId, { name, email, phone });
    return NextResponse.json(patient);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar paciente" }, { status: 500 });
  }
}

// DELETE /api/patients - Delete a patient
export async function DELETE(request: NextRequest) {
  const rateLimit = checkRateLimit(request, "api");
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetIn);
  }

  const searchParams = request.nextUrl.searchParams;
  const params = {
    patientId: searchParams.get("patientId") || "",
  };

  const validation = patientDeleteSchema.safeParse(params);
  if (!validation.success) {
    return NextResponse.json({ error: getValidationError(validation.error) }, { status: 400 });
  }

  try {
    await deletePatient(validation.data.patientId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao excluir paciente" }, { status: 500 });
  }
}
