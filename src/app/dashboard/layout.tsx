export const dynamic = "force-dynamic";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getNutritionist } from "@/services/patients";
import { getNutritionistId } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const nutritionistId = await getNutritionistId();
  const nutritionist = await getNutritionist(nutritionistId);

  if (!nutritionist) {
    // New user needs to complete onboarding
    redirect("/onboarding");
  }

  return <DashboardShell nutritionistName={nutritionist.name}>{children}</DashboardShell>;
}
