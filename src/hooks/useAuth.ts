"use client";

import { useAuth } from "@/contexts/AuthContext";

export { useAuth };

/**
 * Get the nutritionist ID from the authenticated user
 * In our schema, nutritionist.id = auth.uid()
 * Returns null if not authenticated
 */
export function useNutritionistId(): string | null {
  const { user } = useAuth();
  return user?.id ?? null;
}

/**
 * Check if the user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { user, isLoading } = useAuth();
  return !isLoading && user !== null;
}

/**
 * Get user email
 */
export function useUserEmail(): string | null {
  const { user } = useAuth();
  return user?.email ?? null;
}
