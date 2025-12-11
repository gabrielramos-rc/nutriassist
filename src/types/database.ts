export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      nutritionists: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          business_hours: Json;
          faq_responses: Json;
          appointment_duration: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          business_hours?: Json;
          faq_responses?: Json;
          appointment_duration?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          business_hours?: Json;
          faq_responses?: Json;
          appointment_duration?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      patients: {
        Row: {
          id: string;
          nutritionist_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          diet_pdf_url: string | null;
          diet_extracted_text: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nutritionist_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          diet_pdf_url?: string | null;
          diet_extracted_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nutritionist_id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          diet_pdf_url?: string | null;
          diet_extracted_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_sessions: {
        Row: {
          id: string;
          nutritionist_id: string;
          patient_id: string | null;
          channel: "web" | "whatsapp";
          status: "active" | "closed";
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nutritionist_id: string;
          patient_id?: string | null;
          channel?: "web" | "whatsapp";
          status?: "active" | "closed";
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nutritionist_id?: string;
          patient_id?: string | null;
          channel?: "web" | "whatsapp";
          status?: "active" | "closed";
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          chat_session_id: string;
          sender: "patient" | "nina" | "nutritionist";
          content: string;
          intent: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          chat_session_id: string;
          sender: "patient" | "nina" | "nutritionist";
          content: string;
          intent?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          chat_session_id?: string;
          sender?: "patient" | "nina" | "nutritionist";
          content?: string;
          intent?: string | null;
          metadata?: Json;
          created_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          nutritionist_id: string;
          patient_id: string;
          starts_at: string;
          ends_at: string;
          status: "scheduled" | "completed" | "cancelled" | "no_show";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nutritionist_id: string;
          patient_id: string;
          starts_at: string;
          ends_at: string;
          status?: "scheduled" | "completed" | "cancelled" | "no_show";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nutritionist_id?: string;
          patient_id?: string;
          starts_at?: string;
          ends_at?: string;
          status?: "scheduled" | "completed" | "cancelled" | "no_show";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      handoffs: {
        Row: {
          id: string;
          chat_session_id: string;
          reason: string;
          status: "pending" | "resolved";
          resolved_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          chat_session_id: string;
          reason: string;
          status?: "pending" | "resolved";
          resolved_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          chat_session_id?: string;
          reason?: string;
          status?: "pending" | "resolved";
          resolved_at?: string | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      channel_type: "web" | "whatsapp";
      session_status: "active" | "closed";
      sender_type: "patient" | "nina" | "nutritionist";
      appointment_status: "scheduled" | "completed" | "cancelled" | "no_show";
      handoff_status: "pending" | "resolved";
    };
  };
};
