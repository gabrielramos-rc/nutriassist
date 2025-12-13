import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

/**
 * Get the current authenticated user (server-side)
 * Returns null if not authenticated
 */
export async function getUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Require authentication - redirects to login if not authenticated
 * Use in server components that need auth
 */
export async function requireAuth(): Promise<User> {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/**
 * Get the nutritionist ID from the authenticated user
 * In our schema, nutritionist.id = auth.uid()
 */
export async function getNutritionistId(): Promise<string> {
  const user = await requireAuth();
  return user.id;
}

/**
 * Check if user is authenticated without redirecting
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getUser();
  return user !== null;
}

/**
 * Sign out the current user (server action)
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
