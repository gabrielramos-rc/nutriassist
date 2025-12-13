import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Get the authenticated user from the request
 * Returns null if not authenticated
 */
export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Require authentication for an API route
 * Returns the user if authenticated, or an error response if not
 */
export async function requireApiAuth(): Promise<
  { user: { id: string; email?: string }; error: null } | { user: null; error: NextResponse }
> {
  const user = await getAuthUser();

  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
    };
  }

  return {
    user: { id: user.id, email: user.email },
    error: null,
  };
}

/**
 * Validate that the authenticated user owns the nutritionist resource
 * @param nutritionistId - The nutritionist ID from the request
 * @returns Error response if validation fails, null if valid
 */
export async function validateNutritionistOwnership(
  nutritionistId: string
): Promise<NextResponse | null> {
  const { user, error } = await requireApiAuth();

  if (error) {
    return error;
  }

  if (user.id !== nutritionistId) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  return null;
}
