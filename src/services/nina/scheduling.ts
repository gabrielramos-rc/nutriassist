import { formatDateTime } from "@/lib/utils";
import {
  getAvailableSlots,
  getNextAppointment,
  createAppointment,
  cancelAppointment,
} from "@/services/appointments";
import { classifySchedulingSubIntent } from "./intents";
import { RESPONSE_TEMPLATES } from "@/constants/nina";
import type {
  Nutritionist,
  Patient,
  NinaResponse,
  SchedulingSubIntent,
  AppointmentSlot,
} from "@/types";

/**
 * Handle scheduling-related messages
 */
export async function handleScheduling(
  message: string,
  nutritionist: Nutritionist,
  patient: Patient | null | undefined
): Promise<NinaResponse> {
  const subIntent = await classifySchedulingSubIntent(message);

  switch (subIntent) {
    case "book":
      return handleBooking(nutritionist, patient);
    case "check_availability":
      return handleCheckAvailability(nutritionist);
    case "reschedule":
      return handleReschedule(nutritionist, patient);
    case "cancel":
      return handleCancel(nutritionist, patient);
    default:
      return handleCheckAvailability(nutritionist);
  }
}

/**
 * Handle new booking request
 */
async function handleBooking(
  nutritionist: Nutritionist,
  patient: Patient | null | undefined
): Promise<NinaResponse> {
  const slots = await getAvailableSlots(nutritionist, 14, 5);

  if (slots.length === 0) {
    return {
      content: `Poxa, não encontrei horários disponíveis nos próximos dias. Quer que eu avise a ${nutritionist.name} para entrar em contato com você?`,
      intent: "scheduling",
      subIntent: "book",
      metadata: {
        requiresHandoff: true,
        handoffReason: "no_available_slots",
      },
    };
  }

  const slotList = slots
    .map((s, i) => `${i + 1}. ${s.formatted}`)
    .join("\n");

  return {
    content: `Ótimo! Tenho esses horários disponíveis:\n\n${slotList}\n\nQual prefere? Responda com o número do horário escolhido.`,
    intent: "scheduling",
    subIntent: "book",
    metadata: {
      availableSlots: slots,
    },
  };
}

/**
 * Handle check availability request
 */
async function handleCheckAvailability(
  nutritionist: Nutritionist
): Promise<NinaResponse> {
  const slots = await getAvailableSlots(nutritionist, 14, 5);

  if (slots.length === 0) {
    return {
      content: `No momento não há horários disponíveis nos próximos 14 dias. Quer que eu avise quando abrir uma vaga?`,
      intent: "scheduling",
      subIntent: "check_availability",
      metadata: {
        availableSlots: [],
      },
    };
  }

  const slotList = slots
    .map((s, i) => `${i + 1}. ${s.formatted}`)
    .join("\n");

  return {
    content: `Aqui estão os próximos horários disponíveis:\n\n${slotList}\n\nGostaria de agendar algum desses horários?`,
    intent: "scheduling",
    subIntent: "check_availability",
    metadata: {
      availableSlots: slots,
    },
  };
}

/**
 * Handle reschedule request
 */
async function handleReschedule(
  nutritionist: Nutritionist,
  patient: Patient | null | undefined
): Promise<NinaResponse> {
  if (!patient) {
    return {
      content: `Para remarcar sua consulta, preciso identificar você primeiro. Poderia me informar seu nome completo ou email?`,
      intent: "scheduling",
      subIntent: "reschedule",
      metadata: {
        requiresHandoff: true,
        handoffReason: "patient_not_identified",
      },
    };
  }

  const nextAppointment = await getNextAppointment(patient.id, nutritionist.id);

  if (!nextAppointment) {
    return {
      content: `Não encontrei nenhuma consulta agendada para você. Gostaria de agendar uma nova consulta?`,
      intent: "scheduling",
      subIntent: "reschedule",
    };
  }

  const slots = await getAvailableSlots(nutritionist, 14, 5);
  const currentDate = formatDateTime(nextAppointment.starts_at);

  if (slots.length === 0) {
    return {
      content: `Sua consulta está marcada para ${currentDate}, mas não encontrei outros horários disponíveis no momento. Quer manter esse horário ou prefere que a ${nutritionist.name} entre em contato?`,
      intent: "scheduling",
      subIntent: "reschedule",
      metadata: {
        requiresHandoff: true,
        handoffReason: "no_slots_for_reschedule",
      },
    };
  }

  const slotList = slots
    .map((s, i) => `${i + 1}. ${s.formatted}`)
    .join("\n");

  return {
    content: `Sua consulta atual está marcada para ${currentDate}.\n\nPosso remarcar para um desses horários:\n\n${slotList}\n\nQual prefere?`,
    intent: "scheduling",
    subIntent: "reschedule",
    metadata: {
      availableSlots: slots,
      currentAppointmentId: nextAppointment.id,
    },
  };
}

/**
 * Handle cancel request
 */
async function handleCancel(
  nutritionist: Nutritionist,
  patient: Patient | null | undefined
): Promise<NinaResponse> {
  if (!patient) {
    return {
      content: `Para cancelar sua consulta, preciso identificar você primeiro. Poderia me informar seu nome completo ou email?`,
      intent: "scheduling",
      subIntent: "cancel",
      metadata: {
        requiresHandoff: true,
        handoffReason: "patient_not_identified",
      },
    };
  }

  const nextAppointment = await getNextAppointment(patient.id, nutritionist.id);

  if (!nextAppointment) {
    return {
      content: `Não encontrei nenhuma consulta agendada para você. Posso te ajudar com outra coisa?`,
      intent: "scheduling",
      subIntent: "cancel",
    };
  }

  const appointmentDate = formatDateTime(nextAppointment.starts_at);

  return {
    content: `Sua consulta está marcada para ${appointmentDate}. Tem certeza que deseja cancelar?\n\nResponda "sim" para confirmar o cancelamento.`,
    intent: "scheduling",
    subIntent: "cancel",
    metadata: {
      currentAppointmentId: nextAppointment.id,
    },
  };
}

/**
 * Process slot selection (when user responds with a number)
 */
export async function processSlotSelection(
  selection: string,
  availableSlots: AppointmentSlot[],
  nutritionist: Nutritionist,
  patient: Patient
): Promise<NinaResponse> {
  const slotIndex = parseInt(selection, 10) - 1;

  if (isNaN(slotIndex) || slotIndex < 0 || slotIndex >= availableSlots.length) {
    return {
      content: `Não entendi sua escolha. Por favor, responda com o número do horário desejado (1-${availableSlots.length}).`,
      intent: "scheduling",
      subIntent: "book",
      metadata: {
        availableSlots,
      },
    };
  }

  const selectedSlot = availableSlots[slotIndex];
  const result = await createAppointment(
    nutritionist.id,
    patient.id,
    selectedSlot.startsAt,
    nutritionist.appointment_duration || 60
  );

  if (!result.success) {
    return {
      content: `Ops! ${result.error}. Por favor, escolha outro horário.`,
      intent: "scheduling",
      subIntent: "book",
      metadata: {
        availableSlots: availableSlots.filter((_, i) => i !== slotIndex),
      },
    };
  }

  return {
    content: RESPONSE_TEMPLATES.schedulingConfirm(selectedSlot.formatted),
    intent: "scheduling",
    subIntent: "book",
  };
}

/**
 * Process cancellation confirmation
 */
export async function processCancellation(
  appointmentId: string
): Promise<NinaResponse> {
  const result = await cancelAppointment(appointmentId);

  if (!result.success) {
    return {
      content: `Não consegui cancelar a consulta. ${result.error}`,
      intent: "scheduling",
      subIntent: "cancel",
    };
  }

  return {
    content: RESPONSE_TEMPLATES.schedulingCancelled,
    intent: "scheduling",
    subIntent: "cancel",
  };
}
