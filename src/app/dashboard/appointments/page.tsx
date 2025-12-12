"use client";

import { useState, useEffect, useCallback } from "react";
import { format, startOfMonth, endOfMonth, addMonths } from "date-fns";
import { AppointmentCalendar } from "@/components/dashboard/AppointmentCalendar";
import { AppointmentModal } from "@/components/dashboard/AppointmentModal";

const TEST_NUTRITIONIST_ID = "11111111-1111-1111-1111-111111111111";

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
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAppointments = useCallback(async () => {
    try {
      // Fetch appointments for a 3-month window
      const startDate = format(startOfMonth(new Date()), "yyyy-MM-dd");
      const endDate = format(endOfMonth(addMonths(new Date(), 2)), "yyyy-MM-dd");

      const res = await fetch(
        `/api/appointments?nutritionistId=${TEST_NUTRITIONIST_ID}&startDate=${startDate}&endDate=${endDate}`
      );
      const data = await res.json();
      setAppointments(data);
    } catch {
      // Failed to fetch appointments
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      await fetch(`/api/appointments?appointmentId=${appointmentId}`, {
        method: "DELETE",
      });
      await fetchAppointments();
    } catch {
      // Failed to cancel appointment
    }
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          status: "completed",
        }),
      });
      await fetchAppointments();
    } catch {
      // Failed to complete appointment
    }
  };

  const handleNoShowAppointment = async (appointmentId: string) => {
    try {
      await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          status: "no_show",
        }),
      });
      await fetchAppointments();
    } catch {
      // Failed to mark no-show
    }
  };

  const handleUpdateNotes = async (appointmentId: string, notes: string) => {
    try {
      await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          notes,
        }),
      });
      await fetchAppointments();
    } catch {
      // Failed to update notes
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
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
