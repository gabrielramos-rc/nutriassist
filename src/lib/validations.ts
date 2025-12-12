import { z } from "zod";

// Common schemas
const uuidSchema = z.string().uuid("Invalid UUID format");

const trimmedString = (maxLength: number) =>
  z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().min(1, "Cannot be empty").max(maxLength, `Maximum ${maxLength} characters`));

// Chat API
export const chatRequestSchema = z.object({
  message: trimmedString(2000),
  nutritionistId: uuidSchema.optional(),
  patientId: uuidSchema.optional(),
  sessionId: uuidSchema.optional(),
});

// Appointments API
export const appointmentGetSchema = z.object({
  nutritionistId: uuidSchema,
  status: z.enum(["scheduled", "completed", "cancelled", "no_show"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  patientId: uuidSchema.optional(),
});

export const appointmentCreateSchema = z.object({
  nutritionistId: uuidSchema,
  patientId: uuidSchema,
  startsAt: z.string().min(1, "startsAt is required"),
  duration: z.number().min(15).max(480).optional(),
});

export const appointmentUpdateSchema = z
  .object({
    appointmentId: uuidSchema,
    newStartsAt: z.string().optional(),
    duration: z.number().min(15).max(480).optional(),
    status: z.enum(["scheduled", "completed", "cancelled", "no_show"]).optional(),
    notes: z.string().max(500).optional(),
  })
  .refine((data) => data.newStartsAt || data.status || data.notes !== undefined, {
    message: "newStartsAt, status, or notes is required",
  });

export const appointmentDeleteSchema = z.object({
  appointmentId: uuidSchema,
});

// Patients API
export const patientGetSchema = z.object({
  nutritionistId: uuidSchema,
  patientId: uuidSchema.optional(),
});

export const patientCreateSchema = z.object({
  nutritionistId: uuidSchema,
  name: trimmedString(100),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z
    .string()
    .max(20)
    .optional()
    .transform((s) => s?.trim() || undefined),
});

export const patientUpdateSchema = z.object({
  patientId: uuidSchema,
  name: trimmedString(100).optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z
    .string()
    .max(20)
    .optional()
    .transform((s) => s?.trim() || undefined),
});

export const patientDeleteSchema = z.object({
  patientId: uuidSchema,
});

// Conversations API
export const conversationGetSchema = z.object({
  nutritionistId: uuidSchema,
  sessionId: uuidSchema.optional(),
});

export const conversationReplySchema = z.object({
  sessionId: uuidSchema,
  message: trimmedString(2000),
});

// Handoffs API
export const handoffGetSchema = z.object({
  nutritionistId: uuidSchema,
});

export const handoffUpdateSchema = z.object({
  handoffId: uuidSchema,
  status: z.enum(["pending", "resolved"]),
});

// Nutritionists API
export const nutritionistGetSchema = z.object({
  nutritionistId: uuidSchema,
});

// Business hours schema matching database structure
const businessHoursSchema = z
  .object({
    start: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
    end: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
    days: z.array(z.number().min(0).max(6)),
  })
  .optional();

// FAQ responses schema
const faqResponsesSchema = z
  .object({
    price: z.string().max(500).optional(),
    location: z.string().max(500).optional(),
    preparation: z.string().max(1000).optional(),
  })
  .optional();

export const nutritionistUpdateSchema = z.object({
  nutritionistId: uuidSchema,
  name: trimmedString(100).optional(),
  email: z.string().email("Invalid email").optional(),
  phone: z.string().max(20).optional(),
  business_hours: businessHoursSchema,
  appointment_duration: z.number().min(15).max(480).optional(),
  faq_responses: faqResponsesSchema,
});

// Upload API
export const uploadSchema = z.object({
  patientId: uuidSchema,
});

// Helper to extract validation error message
export function getValidationError(error: z.ZodError): string {
  return error.issues[0]?.message || "Validation failed";
}
