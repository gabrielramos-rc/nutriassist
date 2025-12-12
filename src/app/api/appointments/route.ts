import { NextRequest, NextResponse } from "next/server";
import {
  createAppointment,
  listAppointments,
  cancelAppointment,
  rescheduleAppointment,
  getAppointment,
  updateAppointmentStatus,
  updateAppointmentNotes,
} from "@/services/appointments";
import { getNutritionist } from "@/services/patients";
import {
  appointmentGetSchema,
  appointmentCreateSchema,
  appointmentUpdateSchema,
  appointmentDeleteSchema,
  getValidationError,
} from "@/lib/validations";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

/**
 * GET /api/appointments
 * List appointments for a nutritionist
 */
export async function GET(request: NextRequest) {
  const rateLimit = checkRateLimit(request, "api");
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetIn);
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const params = {
      nutritionistId: searchParams.get("nutritionistId") || "",
      status: searchParams.get("status") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      patientId: searchParams.get("patientId") || undefined,
    };

    const validation = appointmentGetSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json({ error: getValidationError(validation.error) }, { status: 400 });
    }

    const appointments = await listAppointments(validation.data.nutritionistId, {
      status: validation.data.status,
      startDate: validation.data.startDate,
      endDate: validation.data.endDate,
      patientId: validation.data.patientId,
    });

    return NextResponse.json(appointments);
  } catch {
    return NextResponse.json({ error: "Failed to list appointments" }, { status: 500 });
  }
}

/**
 * POST /api/appointments
 * Create a new appointment
 */
export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, "api");
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetIn);
  }

  try {
    const body = await request.json();

    const validation = appointmentCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: getValidationError(validation.error) }, { status: 400 });
    }

    const { nutritionistId, patientId, startsAt, duration } = validation.data;

    // Verify nutritionist exists
    const nutritionist = await getNutritionist(nutritionistId);
    if (!nutritionist) {
      return NextResponse.json({ error: "Nutritionist not found" }, { status: 404 });
    }

    const result = await createAppointment(
      nutritionistId,
      patientId,
      startsAt,
      duration || nutritionist.appointment_duration || 60
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    return NextResponse.json({ appointment: result.appointment }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
  }
}

/**
 * PATCH /api/appointments
 * Reschedule an appointment, update status, or update notes
 */
export async function PATCH(request: NextRequest) {
  const rateLimit = checkRateLimit(request, "api");
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetIn);
  }

  try {
    const body = await request.json();

    const validation = appointmentUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: getValidationError(validation.error) }, { status: 400 });
    }

    const { appointmentId, newStartsAt, duration, status, notes } = validation.data;

    // Get existing appointment
    const existing = await getAppointment(appointmentId);
    if (!existing) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // If status is provided, update status
    if (status) {
      const result = await updateAppointmentStatus(appointmentId, status);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    // If notes is provided (including empty string to clear), update notes
    if (notes !== undefined) {
      const result = await updateAppointmentNotes(appointmentId, notes || null);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    // Otherwise, reschedule
    const result = await rescheduleAppointment(appointmentId, newStartsAt!, duration || 60);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    return NextResponse.json({ appointment: result.appointment });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to update appointment",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/appointments
 * Cancel an appointment
 */
export async function DELETE(request: NextRequest) {
  const rateLimit = checkRateLimit(request, "api");
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetIn);
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const params = {
      appointmentId: searchParams.get("appointmentId") || "",
    };

    const validation = appointmentDeleteSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json({ error: getValidationError(validation.error) }, { status: 400 });
    }

    const result = await cancelAppointment(validation.data.appointmentId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to cancel appointment" }, { status: 500 });
  }
}
