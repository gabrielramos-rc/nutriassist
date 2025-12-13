import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  // Redirect authenticated users to dashboard
  const user = await getUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-green-700 hover:text-green-800"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <span className="font-semibold text-xl">NutriAssist</span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4">{children}</main>

      {/* Footer */}
      <footer className="p-4 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} NutriAssist. Todos os direitos reservados.
      </footer>
    </div>
  );
}
