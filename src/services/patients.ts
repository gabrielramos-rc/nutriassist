import { createClient } from "@supabase/supabase-js";
import type { Patient, Nutritionist } from "@/types";

// Create untyped admin client to avoid complex type inference issues
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

/**
 * Get patient by ID
 */
export async function getPatient(patientId: string): Promise<Patient | null> {
  const supabase = getSupabase();

  const { data } = await supabase
    .from("patients")
    .select("*")
    .eq("id", patientId)
    .single();

  return data as Patient | null;
}

/**
 * Get patient by phone number (for WhatsApp identification)
 */
export async function getPatientByPhone(
  phone: string,
  nutritionistId: string
): Promise<Patient | null> {
  const supabase = getSupabase();

  // Normalize phone number (remove non-digits)
  const normalizedPhone = phone.replace(/\D/g, "");

  const { data } = await supabase
    .from("patients")
    .select("*")
    .eq("nutritionist_id", nutritionistId)
    .or(`phone.eq.${normalizedPhone},phone.eq.${phone}`)
    .single();

  return data as Patient | null;
}

/**
 * Get patient by email
 */
export async function getPatientByEmail(
  email: string,
  nutritionistId: string
): Promise<Patient | null> {
  const supabase = getSupabase();

  const { data } = await supabase
    .from("patients")
    .select("*")
    .eq("nutritionist_id", nutritionistId)
    .eq("email", email.toLowerCase())
    .single();

  return data as Patient | null;
}

/**
 * Get nutritionist by ID
 */
export async function getNutritionist(nutritionistId: string): Promise<Nutritionist | null> {
  const supabase = getSupabase();

  const { data } = await supabase
    .from("nutritionists")
    .select("*")
    .eq("id", nutritionistId)
    .single();

  return data as Nutritionist | null;
}

/**
 * Get patient's diet text for Q&A
 */
export async function getPatientDietText(patientId: string): Promise<string | null> {
  const supabase = getSupabase();

  const { data } = await supabase
    .from("patients")
    .select("diet_extracted_text")
    .eq("id", patientId)
    .single();

  return (data as { diet_extracted_text: string | null } | null)?.diet_extracted_text || null;
}
