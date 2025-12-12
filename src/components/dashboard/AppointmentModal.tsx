"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { X, Calendar, Clock, User, Trash2, CheckCircle, XCircle, Edit2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onCancel: (appointmentId: string) => Promise<void>;
  onComplete: (appointmentId: string) => Promise<void>;
  onNoShow: (appointmentId: string) => Promise<void>;
  onUpdateNotes: (appointmentId: string, notes: string) => Promise<void>;
}

export function AppointmentModal({
  isOpen,
  onClose,
  appointment,
  onCancel,
  onComplete,
  onNoShow,
  onUpdateNotes,
}: AppointmentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  // Sync notes state with appointment
  useEffect(() => {
    if (appointment) {
      setNotes(appointment.notes || "");
      setIsEditingNotes(false);
    }
  }, [appointment]);

  if (!isOpen || !appointment) return null;

  const handleAction = async (action: () => Promise<void>) => {
    setIsLoading(true);
    try {
      await action();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "scheduled":
        return { label: "Agendado", color: "bg-green-100 text-green-700" };
      case "completed":
        return { label: "Realizado", color: "bg-blue-100 text-blue-700" };
      case "cancelled":
        return { label: "Cancelado", color: "bg-red-100 text-red-700" };
      case "no_show":
        return { label: "Não compareceu", color: "bg-orange-100 text-orange-700" };
      default:
        return { label: status, color: "bg-gray-100 text-gray-700" };
    }
  };

  const status = getStatusLabel(appointment.status);
  const isPast = new Date(appointment.starts_at) < new Date();
  const canEdit = appointment.status === "scheduled";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Detalhes da Consulta</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Status</span>
            <span className={cn("px-2.5 py-1 text-xs font-medium rounded-full", status.color)}>
              {status.label}
            </span>
          </div>

          {/* Patient */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {appointment.patients?.name || "Paciente não identificado"}
              </p>
              <p className="text-sm text-gray-500">Paciente</p>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">
                {format(parseISO(appointment.starts_at), "EEEE, dd 'de' MMMM 'de' yyyy", {
                  locale: ptBR,
                })}
              </p>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">
                {format(parseISO(appointment.starts_at), "HH:mm")} -{" "}
                {format(parseISO(appointment.ends_at), "HH:mm")}
              </p>
            </div>
          </div>

          {/* Notes */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Observações</p>
              {canEdit && !isEditingNotes && (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>
            {isEditingNotes ? (
              <div className="space-y-2">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder="Adicione observações sobre a consulta..."
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setNotes(appointment.notes || "");
                      setIsEditingNotes(false);
                    }}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={async () => {
                      setIsLoading(true);
                      try {
                        await onUpdateNotes(appointment.id, notes);
                        setIsEditingNotes(false);
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    disabled={isLoading}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors"
                  >
                    <Save className="w-3 h-3" />
                    Salvar
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-900 text-sm">
                {notes || <span className="text-gray-400 italic">Nenhuma observação</span>}
              </p>
            )}
          </div>

          {/* Actions */}
          {canEdit && (
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <p className="text-sm font-medium text-gray-700 mb-2">Ações</p>

              {isPast ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(() => onComplete(appointment.id))}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Realizada
                  </button>
                  <button
                    onClick={() => handleAction(() => onNoShow(appointment.id))}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Não compareceu
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (confirm("Tem certeza que deseja cancelar esta consulta?")) {
                      handleAction(() => onCancel(appointment.id));
                    }
                  }}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:bg-gray-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Cancelar Consulta
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
