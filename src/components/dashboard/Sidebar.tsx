"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, Users, Calendar, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  nutritionistName: string;
}

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/conversations",
    label: "Conversas",
    icon: MessageSquare,
  },
  {
    href: "/dashboard/patients",
    label: "Pacientes",
    icon: Users,
  },
  {
    href: "/dashboard/appointments",
    label: "Agenda",
    icon: Calendar,
  },
  {
    href: "/dashboard/settings",
    label: "Configurações",
    icon: Settings,
  },
];

export function Sidebar({ nutritionistName }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-green-600">NutriAssist</h1>
        <p className="text-sm text-gray-500 mt-1">{nutritionistName}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors",
                    isActive
                      ? "bg-green-50 text-green-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button className="flex items-center gap-3 px-4 py-2.5 w-full text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors">
          <LogOut className="w-5 h-5" />
          Sair
        </button>
      </div>
    </aside>
  );
}
