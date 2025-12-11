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
 * Update nutritionist profile
 */
export async function updateNutritionist(
  nutritionistId: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    business_hours?: Record<string, unknown>;
    appointment_duration?: number;
    faq_responses?: Record<string, string>;
  }
): Promise<Nutritionist> {
  const supabase = getSupabase();

  const { data: updated, error } = await supabase
    .from("nutritionists")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", nutritionistId)
    .select()
    .single();

  if (error || !updated) {
    throw new Error(`Failed to update nutritionist: ${error?.message}`);
  }

  return updated as Nutritionist;
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

/**
 * Update patient's diet PDF URL and extracted text
 */
export async function updatePatientDiet(
  patientId: string,
  dietPdfUrl: string,
  dietExtractedText: string
): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from("patients")
    .update({
      diet_pdf_url: dietPdfUrl,
      diet_extracted_text: dietExtractedText,
      updated_at: new Date().toISOString(),
    })
    .eq("id", patientId);

  if (error) {
    throw new Error(`Failed to update patient diet: ${error.message}`);
  }
}

/**
 * Get all patients for a nutritionist
 */
export async function getPatientsByNutritionist(
  nutritionistId: string
): Promise<Patient[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("nutritionist_id", nutritionistId)
    .order("name");

  if (error) {
    console.error("Error fetching patients:", error);
    return [];
  }

  return (data || []) as Patient[];
}

/**
 * Create a new patient
 */
export async function createPatient(
  nutritionistId: string,
  name: string,
  email?: string,
  phone?: string
): Promise<Patient> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("patients")
    .insert({
      nutritionist_id: nutritionistId,
      name,
      email: email || null,
      phone: phone || null,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to create patient: ${error?.message}`);
  }

  return data as Patient;
}

/**
 * Get patient count for a nutritionist
 */
export async function getPatientCount(nutritionistId: string): Promise<number> {
  const supabase = getSupabase();

  const { count, error } = await supabase
    .from("patients")
    .select("id", { count: "exact", head: true })
    .eq("nutritionist_id", nutritionistId);

  if (error) {
    console.error("Error counting patients:", error);
    return 0;
  }

  return count || 0;
}

/**
 * Update a patient
 */
export async function updatePatient(
  patientId: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
  }
): Promise<Patient> {
  const supabase = getSupabase();

  const { data: updated, error } = await supabase
    .from("patients")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", patientId)
    .select()
    .single();

  if (error || !updated) {
    throw new Error(`Failed to update patient: ${error?.message}`);
  }

  return updated as Patient;
}

/**
 * Delete a patient
 */
export async function deletePatient(patientId: string): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from("patients")
    .delete()
    .eq("id", patientId);

  if (error) {
    throw new Error(`Failed to delete patient: ${error.message}`);
  }
}
