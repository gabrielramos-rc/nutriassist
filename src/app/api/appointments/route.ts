import { NextRequest, NextResponse } from "next/server";
import {
  createAppointment,
  listAppointments,
  cancelAppointment,
  rescheduleAppointment,
  getAppointment,
} from "@/services/appointments";
import { getNutritionist } from "@/services/patients";

/**
 * GET /api/appointments
 * List appointments for a nutritionist
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const nutritionistId = searchParams.get("nutritionistId");

    if (!nutritionistId) {
      return NextResponse.json(
        { error: "nutritionistId is required" },
        { status: 400 }
      );
    }

    const appointments = await listAppointments(nutritionistId, {
      status: searchParams.get("status") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      patientId: searchParams.get("patientId") || undefined,
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("Error listing appointments:", error);
    return NextResponse.json(
      { error: "Failed to list appointments" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/appointments
 * Create a new appointment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nutritionistId, patientId, startsAt, duration } = body;

    if (!nutritionistId || !patientId || !startsAt) {
      return NextResponse.json(
        { error: "nutritionistId, patientId, and startsAt are required" },
        { status: 400 }
      );
    }

    // Verify nutritionist exists
    const nutritionist = await getNutritionist(nutritionistId);
    if (!nutritionist) {
      return NextResponse.json(
        { error: "Nutritionist not found" },
        { status: 404 }
      );
    }

    const result = await createAppointment(
      nutritionistId,
      patientId,
      startsAt,
      duration || nutritionist.appointment_duration || 60
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { appointment: result.appointment },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/appointments
 * Reschedule an appointment
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { appointmentId, newStartsAt, duration } = body;

    if (!appointmentId || !newStartsAt) {
      return NextResponse.json(
        { error: "appointmentId and newStartsAt are required" },
        { status: 400 }
      );
    }

    // Get existing appointment to determine duration
    const existing = await getAppointment(appointmentId);
    if (!existing) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    const result = await rescheduleAppointment(
      appointmentId,
      newStartsAt,
      duration || 60
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 409 }
      );
    }

    return NextResponse.json({ appointment: result.appointment });
  } catch (error) {
    console.error("Error rescheduling appointment:", error);
    return NextResponse.json(
      { error: "Failed to reschedule appointment" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/appointments
 * Cancel an appointment
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const appointmentId = searchParams.get("appointmentId");

    if (!appointmentId) {
      return NextResponse.json(
        { error: "appointmentId is required" },
        { status: 400 }
      );
    }

    const result = await cancelAppointment(appointmentId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return NextResponse.json(
      { error: "Failed to cancel appointment" },
      { status: 500 }
    );
  }
}
