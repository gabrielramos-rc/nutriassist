import type { Database } from "./database";

// Database row types
export type Nutritionist = Database["public"]["Tables"]["nutritionists"]["Row"];
export type Patient = Database["public"]["Tables"]["patients"]["Row"];
export type ChatSession = Database["public"]["Tables"]["chat_sessions"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
export type Handoff = Database["public"]["Tables"]["handoffs"]["Row"];

// Insert types
export type NutritionistInsert = Database["public"]["Tables"]["nutritionists"]["Insert"];
export type PatientInsert = Database["public"]["Tables"]["patients"]["Insert"];
export type ChatSessionInsert = Database["public"]["Tables"]["chat_sessions"]["Insert"];
export type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];
export type AppointmentInsert = Database["public"]["Tables"]["appointments"]["Insert"];
export type HandoffInsert = Database["public"]["Tables"]["handoffs"]["Insert"];

// Update types
export type NutritionistUpdate = Database["public"]["Tables"]["nutritionists"]["Update"];
export type PatientUpdate = Database["public"]["Tables"]["patients"]["Update"];
export type ChatSessionUpdate = Database["public"]["Tables"]["chat_sessions"]["Update"];
export type MessageUpdate = Database["public"]["Tables"]["messages"]["Update"];
export type AppointmentUpdate = Database["public"]["Tables"]["appointments"]["Update"];
export type HandoffUpdate = Database["public"]["Tables"]["handoffs"]["Update"];

// Nina intent types
export type NinaIntent =
  | "greeting"
  | "scheduling"
  | "diet_question"
  | "faq"
  | "handoff"
  | "off_topic"
  | "dangerous";

export type SchedulingSubIntent =
  | "book"
  | "reschedule"
  | "cancel"
  | "check_availability";

// Nina response types
export interface NinaResponse {
  content: string;
  intent: NinaIntent;
  subIntent?: SchedulingSubIntent;
  metadata?: {
    sourceReference?: string;
    availableSlots?: AppointmentSlot[];
    requiresHandoff?: boolean;
    handoffReason?: string;
    faqKey?: string;
  };
}

export interface AppointmentSlot {
  startsAt: string;
  endsAt: string;
  formatted: string;
}

// Business hours type
export interface BusinessHours {
  [day: string]: {
    start: string;
    end: string;
    enabled: boolean;
  };
}

// FAQ responses type
export interface FAQResponses {
  price?: string;
  location?: string;
  preparation?: string;
  duration?: string;
  online?: string;
  [key: string]: string | undefined;
}

// Chat message for UI
export interface ChatMessage {
  id: string;
  sender: "patient" | "nina" | "nutritionist";
  content: string;
  timestamp: Date;
  intent?: NinaIntent;
}

// API request/response types
export interface ChatRequest {
  message: string;
  sessionId?: string;
  nutritionistId: string;
  patientId?: string;
}

export interface ChatResponse {
  response: NinaResponse;
  sessionId: string;
}
