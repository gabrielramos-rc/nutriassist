"use client";

import { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn, formatTime } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Calendar, List } from "lucide-react";

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

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onSelectAppointment: (appointment: Appointment) => void;
  onSelectDate: (date: Date) => void;
}

export function AppointmentCalendar({
  appointments,
  onSelectAppointment,
  onSelectDate,
}: AppointmentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState<"calendar" | "list">("calendar");

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { locale: ptBR });
  const calendarEnd = endOfWeek(monthEnd, { locale: ptBR });

  // Build calendar days
  const calendarDays = useMemo(() => {
    const days: Date[] = [];
    let day = calendarStart;
    while (day <= calendarEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [calendarStart, calendarEnd]);

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    appointments.forEach((apt) => {
      const dateKey = format(parseISO(apt.starts_at), "yyyy-MM-dd");
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(apt);
    });
    return map;
  }, [appointments]);

  const getAppointmentsForDate = (date: Date): Appointment[] => {
    const dateKey = format(date, "yyyy-MM-dd");
    return appointmentsByDate.get(dateKey) || [];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-green-500";
      case "completed":
        return "bg-blue-500";
      case "cancelled":
        return "bg-red-500";
      case "no_show":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Agendado";
      case "completed":
        return "Realizado";
      case "cancelled":
        return "Cancelado";
      case "no_show":
        return "Não compareceu";
      default:
        return status;
    }
  };

  // List view appointments (upcoming only)
  const upcomingAppointments = useMemo(() => {
    return appointments
      .filter((apt) => apt.status === "scheduled" && new Date(apt.starts_at) >= new Date())
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
  }, [appointments]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between p-2 sm:p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
          </button>
          <h2 className="text-sm sm:text-lg font-semibold text-gray-900 min-w-[100px] sm:min-w-[200px] text-center capitalize">
            {format(currentMonth, "MMM yyyy", { locale: ptBR })}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Proximo mes"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
          </button>
        </div>

        <div
          className="flex items-center gap-1 sm:gap-2 bg-gray-100 rounded-lg p-0.5 sm:p-1"
          role="group"
          aria-label="Visualizacao"
        >
          <button
            onClick={() => setView("calendar")}
            aria-pressed={view === "calendar"}
            className={cn(
              "flex items-center gap-1 sm:gap-2 p-2 sm:px-3 sm:py-1.5 rounded-md text-sm font-medium transition-colors",
              view === "calendar"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <Calendar className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Calendario</span>
          </button>
          <button
            onClick={() => setView("list")}
            aria-pressed={view === "list"}
            className={cn(
              "flex items-center gap-1 sm:gap-2 p-2 sm:px-3 sm:py-1.5 rounded-md text-sm font-medium transition-colors",
              view === "list"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <List className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Lista</span>
          </button>
        </div>
      </div>

      {view === "calendar" ? (
        <div className="p-2 sm:p-4">
          {/* Weekday headers - single letter on mobile */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2">
            {[
              { short: "D", full: "Dom" },
              { short: "S", full: "Seg" },
              { short: "T", full: "Ter" },
              { short: "Q", full: "Qua" },
              { short: "Q", full: "Qui" },
              { short: "S", full: "Sex" },
              { short: "S", full: "Sáb" },
            ].map(({ short, full }, index) => (
              <div
                key={`${full}-${index}`}
                className="text-center text-xs sm:text-sm font-medium text-gray-500 py-1 sm:py-2"
              >
                <span className="hidden sm:inline">{full}</span>
                <span className="sm:hidden">{short}</span>
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {calendarDays.map((day) => {
              const dayAppointments = getAppointmentsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => onSelectDate(day)}
                  className={cn(
                    "min-h-[60px] sm:min-h-[80px] md:min-h-[100px] p-1 sm:p-2 text-left border rounded-lg transition-colors",
                    isCurrentMonth ? "bg-white hover:bg-gray-50" : "bg-gray-50 text-gray-400",
                    isToday && "ring-2 ring-green-500"
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-xs sm:text-sm rounded-full",
                      isToday && "bg-green-600 text-white"
                    )}
                  >
                    {format(day, "d")}
                  </span>

                  <div className="mt-0.5 sm:mt-1 space-y-0.5 sm:space-y-1">
                    {dayAppointments.slice(0, 2).map((apt) => (
                      <button
                        key={apt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAppointment(apt);
                        }}
                        className={cn(
                          "w-full text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded truncate text-left text-white",
                          getStatusColor(apt.status)
                        )}
                      >
                        <span className="hidden sm:inline">
                          {formatTime(apt.starts_at)} {apt.patients?.name || "Paciente"}
                        </span>
                        <span className="sm:hidden">{formatTime(apt.starts_at)}</span>
                      </button>
                    ))}
                    {dayAppointments.length > 2 && (
                      <p className="text-[10px] sm:text-xs text-gray-500 px-1">
                        +{dayAppointments.length - 2}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-4">
          {upcomingAppointments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhuma consulta agendada</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {upcomingAppointments.map((apt) => (
                <li key={apt.id}>
                  <button
                    onClick={() => onSelectAppointment(apt)}
                    className="w-full text-left px-4 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">
                            {format(parseISO(apt.starts_at), "dd")}
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(parseISO(apt.starts_at), "MMM", { locale: ptBR })}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {apt.patients?.name || "Paciente"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatTime(apt.starts_at)} - {formatTime(apt.ends_at)}
                          </p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "px-2.5 py-1 text-xs font-medium rounded-full text-white",
                          getStatusColor(apt.status)
                        )}
                      >
                        {getStatusLabel(apt.status)}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
