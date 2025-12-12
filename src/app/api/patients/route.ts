import { NextRequest, NextResponse } from "next/server";
import {
  getPatientsByNutritionist,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
} from "@/services/patients";

// GET /api/patients - List patients for a nutritionist or get a single patient
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const nutritionistId = searchParams.get("nutritionistId");
  const patientId = searchParams.get("patientId");

  if (patientId) {
    const patient = await getPatient(patientId);
    if (!patient) {
      return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 });
    }
    return NextResponse.json(patient);
  }

  if (!nutritionistId) {
    return NextResponse.json({ error: "nutritionistId é obrigatório" }, { status: 400 });
  }

  const patients = await getPatientsByNutritionist(nutritionistId);
  return NextResponse.json(patients);
}

// POST /api/patients - Create a new patient
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nutritionistId, name, email, phone } = body;

    if (!nutritionistId || !name) {
      return NextResponse.json(
        { error: "nutritionistId e name são obrigatórios" },
        { status: 400 }
      );
    }

    const patient = await createPatient(nutritionistId, name, email, phone);
    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    console.error("Error creating patient:", error);
    return NextResponse.json({ error: "Erro ao criar paciente" }, { status: 500 });
  }
}

// PATCH /api/patients - Update a patient
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId, name, email, phone } = body;

    if (!patientId) {
      return NextResponse.json({ error: "patientId é obrigatório" }, { status: 400 });
    }

    const patient = await updatePatient(patientId, { name, email, phone });
    return NextResponse.json(patient);
  } catch (error) {
    console.error("Error updating patient:", error);
    return NextResponse.json({ error: "Erro ao atualizar paciente" }, { status: 500 });
  }
}

// DELETE /api/patients - Delete a patient
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const patientId = searchParams.get("patientId");

  if (!patientId) {
    return NextResponse.json({ error: "patientId é obrigatório" }, { status: 400 });
  }

  try {
    await deletePatient(patientId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting patient:", error);
    return NextResponse.json({ error: "Erro ao excluir paciente" }, { status: 500 });
  }
}
