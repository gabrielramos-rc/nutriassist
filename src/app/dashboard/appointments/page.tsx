"use client";

import { useState, useEffect, useCallback } from "react";
import { format, startOfMonth, endOfMonth, addMonths } from "date-fns";
import { AppointmentCalendar } from "@/components/dashboard/AppointmentCalendar";
import { AppointmentModal } from "@/components/dashboard/AppointmentModal";
import { useToast } from "@/components/ui/Toast";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useNutritionistId } from "@/hooks/useAuth";

interface Patient {
  id: string;
  name: string;
}

interface Appointment {
  id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  notes: string | null;
  patients: Patient | null;
}

export default function AppointmentsPage() {
  const nutritionistId = useNutritionistId();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  const fetchAppointments = useCallback(async () => {
    if (!nutritionistId) return;
    setError(null);
    try {
      // Fetch appointments for a 3-month window
      const startDate = format(startOfMonth(new Date()), "yyyy-MM-dd");
      const endDate = format(endOfMonth(addMonths(new Date(), 2)), "yyyy-MM-dd");

      const res = await fetch(
        `/api/appointments?nutritionistId=${nutritionistId}&startDate=${startDate}&endDate=${endDate}`
      );
      if (!res.ok) {
        throw new Error("Erro ao carregar consultas");
      }
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar consultas";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [nutritionistId]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleSelectAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleSelectDate = (_date: Date) => {
    // Could open a modal to create appointment for that date
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const res = await fetch(`/api/appointments?appointmentId=${appointmentId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Erro ao cancelar consulta");
      }
      await fetchAppointments();
      toast.success("Consulta cancelada!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao cancelar consulta";
      toast.error(message);
      throw err;
    }
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      const res = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          status: "completed",
        }),
      });
      if (!res.ok) {
        throw new Error("Erro ao marcar consulta como realizada");
      }
      await fetchAppointments();
      toast.success("Consulta marcada como realizada!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar consulta";
      toast.error(message);
      throw err;
    }
  };

  const handleNoShowAppointment = async (appointmentId: string) => {
    try {
      const res = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          status: "no_show",
        }),
      });
      if (!res.ok) {
        throw new Error("Erro ao marcar nao comparecimento");
      }
      await fetchAppointments();
      toast.success("Consulta marcada como nao compareceu!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar consulta";
      toast.error(message);
      throw err;
    }
  };

  const handleUpdateNotes = async (appointmentId: string, notes: string) => {
    try {
      const res = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          notes,
        }),
      });
      if (!res.ok) {
        throw new Error("Erro ao salvar observacoes");
      }
      await fetchAppointments();
      toast.success("Observacoes salvas!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao salvar observacoes";
      toast.error(message);
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-gray-900 font-medium mb-2">Erro ao carregar consultas</p>
        <p className="text-gray-500 text-sm mb-4">{error}</p>
        <button
          onClick={() => {
            setIsLoading(true);
            fetchAppointments();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
        <p className="text-gray-500 mt-1">Visualize e gerencie suas consultas</p>
      </div>

      <AppointmentCalendar
        appointments={appointments}
        onSelectAppointment={handleSelectAppointment}
        onSelectDate={handleSelectDate}
      />

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        onCancel={handleCancelAppointment}
        onComplete={handleCompleteAppointment}
        onNoShow={handleNoShowAppointment}
        onUpdateNotes={handleUpdateNotes}
      />
    </div>
  );
}
