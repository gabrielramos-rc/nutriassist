import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Handle OAuth errors
  if (error) {
    const errorMessage = encodeURIComponent(errorDescription || "Erro de autenticação");
    return NextResponse.redirect(`${origin}/login?error=${errorMessage}`);
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      // Check if user needs onboarding (new user without nutritionist record)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: nutritionist } = await supabase
          .from("nutritionists")
          .select("id")
          .eq("id", user.id)
          .single();

        // If no nutritionist record exists, redirect to onboarding
        if (!nutritionist) {
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return to login on error
  return NextResponse.redirect(`${origin}/login?error=callback_failed`);
}
