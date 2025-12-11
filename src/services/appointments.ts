import { createClient } from "@supabase/supabase-js";
import {
  addDays,
  addMinutes,
  format,
  isAfter,
  isBefore,
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Appointment, Nutritionist, BusinessHours, AppointmentSlot } from "@/types";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

const DAYS_MAP: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const DAYS_REVERSE: Record<number, string> = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

/**
 * Get available appointment slots for a nutritionist
 */
export async function getAvailableSlots(
  nutritionist: Nutritionist,
  daysAhead: number = 14,
  maxSlots: number = 10
): Promise<AppointmentSlot[]> {
  const supabase = getSupabase();
  const businessHours = nutritionist.business_hours as BusinessHours;
  const duration = nutritionist.appointment_duration || 60;

  const startDate = new Date();
  const endDate = addDays(startDate, daysAhead);

  // Get existing appointments
  const { data: existingAppointments } = await supabase
    .from("appointments")
    .select("starts_at, ends_at")
    .eq("nutritionist_id", nutritionist.id)
    .eq("status", "scheduled")
    .gte("starts_at", startDate.toISOString())
    .lte("starts_at", endDate.toISOString());

  const bookedSlots = new Set(
    (existingAppointments || []).map((apt) => apt.starts_at)
  );

  const availableSlots: AppointmentSlot[] = [];
  let currentDate = startOfDay(addDays(startDate, 1)); // Start tomorrow

  while (currentDate <= endDate && availableSlots.length < maxSlots) {
    const dayOfWeek = currentDate.getDay();
    const dayName = DAYS_REVERSE[dayOfWeek];
    const dayConfig = businessHours[dayName];

    if (dayConfig?.enabled) {
      const [startHour, startMin] = dayConfig.start.split(":").map(Number);
      const [endHour, endMin] = dayConfig.end.split(":").map(Number);

      let slotTime = setMinutes(setHours(currentDate, startHour), startMin);
      const dayEnd = setMinutes(setHours(currentDate, endHour), endMin);

      while (isBefore(addMinutes(slotTime, duration), dayEnd) ||
             slotTime.getTime() + duration * 60000 === dayEnd.getTime()) {
        const slotIso = slotTime.toISOString();

        // Check if slot is not booked and is in the future
        if (!bookedSlots.has(slotIso) && isAfter(slotTime, new Date())) {
          availableSlots.push({
            startsAt: slotIso,
            endsAt: addMinutes(slotTime, duration).toISOString(),
            formatted: formatSlot(slotTime),
          });

          if (availableSlots.length >= maxSlots) break;
        }

        slotTime = addMinutes(slotTime, duration);
      }
    }

    currentDate = addDays(currentDate, 1);
  }

  return availableSlots;
}

/**
 * Format a slot time for display
 */
function formatSlot(date: Date): string {
  return format(date, "EEE dd/MM 'às' HH:mm", { locale: ptBR });
}

/**
 * Create a new appointment
 */
export async function createAppointment(
  nutritionistId: string,
  patientId: string,
  startsAt: string,
  duration: number = 60
): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
  const supabase = getSupabase();

  // Check if slot is still available
  const { data: existing } = await supabase
    .from("appointments")
    .select("id")
    .eq("nutritionist_id", nutritionistId)
    .eq("starts_at", startsAt)
    .eq("status", "scheduled")
    .single();

  if (existing) {
    return { success: false, error: "Este horário já foi reservado" };
  }

  const endsAt = addMinutes(new Date(startsAt), duration).toISOString();

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      nutritionist_id: nutritionistId,
      patient_id: patientId,
      starts_at: startsAt,
      ends_at: endsAt,
      status: "scheduled",
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, appointment: data as Appointment };
}

/**
 * Get patient's next scheduled appointment
 */
export async function getNextAppointment(
  patientId: string,
  nutritionistId: string
): Promise<Appointment | null> {
  const supabase = getSupabase();

  const { data } = await supabase
    .from("appointments")
    .select("*")
    .eq("patient_id", patientId)
    .eq("nutritionist_id", nutritionistId)
    .eq("status", "scheduled")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(1)
    .single();

  return data as Appointment | null;
}

/**
 * Get appointment by ID
 */
export async function getAppointment(appointmentId: string): Promise<Appointment | null> {
  const supabase = getSupabase();

  const { data } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", appointmentId)
    .single();

  return data as Appointment | null;
}

/**
 * Reschedule an appointment
 */
export async function rescheduleAppointment(
  appointmentId: string,
  newStartsAt: string,
  duration: number = 60
): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
  const supabase = getSupabase();

  // Get existing appointment
  const existing = await getAppointment(appointmentId);
  if (!existing) {
    return { success: false, error: "Consulta não encontrada" };
  }

  // Check if new slot is available
  const { data: conflict } = await supabase
    .from("appointments")
    .select("id")
    .eq("nutritionist_id", existing.nutritionist_id)
    .eq("starts_at", newStartsAt)
    .eq("status", "scheduled")
    .neq("id", appointmentId)
    .single();

  if (conflict) {
    return { success: false, error: "Este horário já foi reservado" };
  }

  const newEndsAt = addMinutes(new Date(newStartsAt), duration).toISOString();

  const { data, error } = await supabase
    .from("appointments")
    .update({
      starts_at: newStartsAt,
      ends_at: newEndsAt,
    })
    .eq("id", appointmentId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, appointment: data as Appointment };
}

/**
 * Cancel an appointment
 */
export async function cancelAppointment(
  appointmentId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from("appointments")
    .update({ status: "cancelled" })
    .eq("id", appointmentId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * List appointments for a nutritionist
 */
export async function listAppointments(
  nutritionistId: string,
  options: {
    status?: string;
    startDate?: string;
    endDate?: string;
    patientId?: string;
  } = {}
): Promise<Appointment[]> {
  const supabase = getSupabase();

  let query = supabase
    .from("appointments")
    .select("*, patients(id, name, email, phone)")
    .eq("nutritionist_id", nutritionistId)
    .order("starts_at", { ascending: true });

  if (options.status) {
    query = query.eq("status", options.status);
  }
  if (options.startDate) {
    query = query.gte("starts_at", options.startDate);
  }
  if (options.endDate) {
    query = query.lte("starts_at", options.endDate);
  }
  if (options.patientId) {
    query = query.eq("patient_id", options.patientId);
  }

  const { data } = await query;

  return (data || []) as Appointment[];
}

/**
 * Get today's appointment count for a nutritionist
 */
export async function getTodayAppointmentCount(nutritionistId: string): Promise<number> {
  const supabase = getSupabase();
  const today = new Date();

  const { count, error } = await supabase
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .eq("nutritionist_id", nutritionistId)
    .eq("status", "scheduled")
    .gte("starts_at", startOfDay(today).toISOString())
    .lte("starts_at", endOfDay(today).toISOString());

  if (error) {
    console.error("Error counting today's appointments:", error);
    return 0;
  }

  return count || 0;
}

/**
 * Get today's appointments for a nutritionist
 */
export async function getTodayAppointments(nutritionistId: string): Promise<Appointment[]> {
  const supabase = getSupabase();
  const today = new Date();

  const { data, error } = await supabase
    .from("appointments")
    .select("*, patients(id, name, email, phone)")
    .eq("nutritionist_id", nutritionistId)
    .eq("status", "scheduled")
    .gte("starts_at", startOfDay(today).toISOString())
    .lte("starts_at", endOfDay(today).toISOString())
    .order("starts_at", { ascending: true });

  if (error) {
    console.error("Error fetching today's appointments:", error);
    return [];
  }

  return (data || []) as Appointment[];
}

/**
 * Update appointment status
 */
export async function updateAppointmentStatus(
  appointmentId: string,
  status: "scheduled" | "completed" | "cancelled" | "no_show"
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", appointmentId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updateAppointmentNotes(
  appointmentId: string,
  notes: string | null
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from("appointments")
    .update({ notes })
    .eq("id", appointmentId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
