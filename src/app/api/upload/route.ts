import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { extractTextFromPDF, isValidPDF, cleanExtractedText } from "@/lib/pdf";
import { updatePatientDiet, getPatient } from "@/services/patients";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const patientId = formData.get("patientId") as string | null;

    // Validate required fields
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!patientId) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
    }

    // Validate patient exists
    const patient = await getPatient(patientId);
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate PDF magic bytes
    if (!isValidPDF(buffer)) {
      return NextResponse.json({ error: "Invalid PDF file" }, { status: 400 });
    }

    // Extract text from PDF
    const extractionResult = await extractTextFromPDF(buffer);
    const cleanedText = cleanExtractedText(extractionResult.text);

    if (!cleanedText || cleanedText.length < 10) {
      return NextResponse.json(
        { error: "Could not extract text from PDF. Please ensure the PDF contains readable text." },
        { status: 400 }
      );
    }

    // Upload to Supabase Storage
    const supabase = getSupabase();
    const fileName = `${patientId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    const { error: uploadError } = await supabase.storage
      .from("diet-pdfs")
      .upload(fileName, buffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: "Failed to upload file to storage" }, { status: 500 });
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage.from("diet-pdfs").getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;

    // Update patient record with diet PDF URL and extracted text
    await updatePatientDiet(patientId, publicUrl, cleanedText);

    return NextResponse.json({
      success: true,
      message: "Diet PDF uploaded successfully",
      data: {
        url: publicUrl,
        numPages: extractionResult.numPages,
        textLength: cleanedText.length,
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
