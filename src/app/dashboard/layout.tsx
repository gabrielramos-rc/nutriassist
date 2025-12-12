import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getNutritionist } from "@/services/patients";

// For MVP, hardcode the nutritionist ID (auth will be added later)
const TEST_NUTRITIONIST_ID = "11111111-1111-1111-1111-111111111111";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const nutritionist = await getNutritionist(TEST_NUTRITIONIST_ID);

  if (!nutritionist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Nutricionista não encontrado</p>
      </div>
    );
  }

  return <DashboardShell nutritionistName={nutritionist.name}>{children}</DashboardShell>;
}
