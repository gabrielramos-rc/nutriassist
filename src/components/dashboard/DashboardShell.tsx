"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";

interface DashboardShellProps {
  nutritionistName: string;
  children: React.ReactNode;
}

export function DashboardShell({ nutritionistName, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-md md:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="w-6 h-6 text-gray-600" />
      </button>

      {/* Overlay - visible on mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <Sidebar
        nutritionistName={nutritionistName}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-4 pt-16 sm:p-6 md:p-8 md:pt-8">{children}</div>
      </main>
    </div>
  );
}
