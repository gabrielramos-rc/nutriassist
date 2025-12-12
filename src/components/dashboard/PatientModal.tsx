"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface Patient {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; email?: string; phone?: string }) => Promise<void>;
  patient?: Patient | null;
}

interface FieldErrors {
  name?: string;
  email?: string;
  phone?: string;
}

export function PatientModal({ isOpen, onClose, onSave, patient }: PatientModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const isEditing = !!patient;

  useEffect(() => {
    if (patient) {
      setName(patient.name);
      setEmail(patient.email || "");
      setPhone(patient.phone || "");
    } else {
      setName("");
      setEmail("");
      setPhone("");
    }
    setError(null);
    setFieldErrors({});
  }, [patient, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FieldErrors = {};

    // Name validation
    if (!name.trim()) {
      newErrors.name = "Nome e obrigatorio";
    } else if (name.trim().length < 2) {
      newErrors.name = "Nome deve ter pelo menos 2 caracteres";
    }

    // Email validation (optional but must be valid if provided)
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "E-mail invalido";
    }

    // Phone validation (optional but must be valid if provided)
    if (phone.trim() && !/^[\d\s()+-]{8,}$/.test(phone.trim())) {
      newErrors.phone = "Telefone invalido";
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      onClose();
    } catch (_err) {
      setError("Erro ao salvar paciente");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="patient-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 id="patient-modal-title" className="text-lg font-semibold text-gray-900">
            {isEditing ? "Editar Paciente" : "Novo Paciente"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5 text-gray-500" aria-hidden="true" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

          <div>
            <label htmlFor="patient-name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome *
            </label>
            <input
              id="patient-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) {
                  setFieldErrors((prev) => ({ ...prev, name: undefined }));
                }
              }}
              aria-required="true"
              aria-invalid={!!fieldErrors.name}
              aria-describedby={fieldErrors.name ? "patient-name-error" : undefined}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                fieldErrors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Nome do paciente"
            />
            {fieldErrors.name && (
              <p id="patient-name-error" className="mt-1 text-sm text-red-500" role="alert">
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="patient-email" className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <input
              id="patient-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? "patient-email-error" : undefined}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                fieldErrors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="email@exemplo.com"
            />
            {fieldErrors.email && (
              <p id="patient-email-error" className="mt-1 text-sm text-red-500" role="alert">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="patient-phone" className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <input
              id="patient-phone"
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (fieldErrors.phone) {
                  setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                }
              }}
              aria-invalid={!!fieldErrors.phone}
              aria-describedby={fieldErrors.phone ? "patient-phone-error" : undefined}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                fieldErrors.phone ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="(11) 99999-9999"
            />
            {fieldErrors.phone && (
              <p id="patient-phone-error" className="mt-1 text-sm text-red-500" role="alert">
                {fieldErrors.phone}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Salvando..." : isEditing ? "Salvar" : "Criar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
