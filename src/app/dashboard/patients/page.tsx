"use client";

import { useState, useEffect, useCallback } from "react";
import { PatientList } from "@/components/dashboard/PatientList";
import { PatientModal } from "@/components/dashboard/PatientModal";
import { UploadDietModal } from "@/components/dashboard/UploadDietModal";
import { useToast } from "@/components/ui/Toast";
import { AlertCircle, RefreshCw } from "lucide-react";

const TEST_NUTRITIONIST_ID = "11111111-1111-1111-1111-111111111111";

interface Patient {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  diet_pdf_url: string | null;
  created_at: string;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedPatientIdForUpload, setSelectedPatientIdForUpload] = useState<string | null>(null);
  const toast = useToast();

  const fetchPatients = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`/api/patients?nutritionistId=${TEST_NUTRITIONIST_ID}`);
      if (!res.ok) {
        throw new Error("Erro ao carregar pacientes");
      }
      const data = await res.json();
      setPatients(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar pacientes";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleAddPatient = () => {
    setSelectedPatient(null);
    setIsPatientModalOpen(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsPatientModalOpen(true);
  };

  const handleSavePatient = async (data: { name: string; email?: string; phone?: string }) => {
    try {
      const res = selectedPatient
        ? await fetch("/api/patients", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              patientId: selectedPatient.id,
              ...data,
            }),
          })
        : await fetch("/api/patients", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nutritionistId: TEST_NUTRITIONIST_ID,
              ...data,
            }),
          });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao salvar paciente");
      }

      await fetchPatients();
      toast.success(selectedPatient ? "Paciente atualizado!" : "Paciente criado!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao salvar paciente";
      toast.error(message);
      throw err; // Re-throw to keep modal open
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    try {
      const res = await fetch(`/api/patients?patientId=${patientId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Erro ao excluir paciente");
      }
      await fetchPatients();
      toast.success("Paciente excluido!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao excluir paciente";
      toast.error(message);
    }
  };

  const handleUploadDiet = (patientId: string) => {
    setSelectedPatientIdForUpload(patientId);
    setIsUploadModalOpen(true);
  };

  const handleViewDiet = (pdfUrl: string) => {
    window.open(pdfUrl, "_blank");
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
        <p className="text-gray-900 font-medium mb-2">Erro ao carregar pacientes</p>
        <p className="text-gray-500 text-sm mb-4">{error}</p>
        <button
          onClick={() => {
            setIsLoading(true);
            fetchPatients();
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
        <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
        <p className="text-gray-500 mt-1">Gerencie seus pacientes e planos alimentares</p>
      </div>

      <PatientList
        patients={patients}
        onAddPatient={handleAddPatient}
        onEditPatient={handleEditPatient}
        onDeletePatient={handleDeletePatient}
        onUploadDiet={handleUploadDiet}
        onViewDiet={handleViewDiet}
      />

      <PatientModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onSave={handleSavePatient}
        patient={selectedPatient}
      />

      {selectedPatientIdForUpload && (
        <UploadDietModal
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            setSelectedPatientIdForUpload(null);
          }}
          patientId={selectedPatientIdForUpload}
          onUploadComplete={fetchPatients}
        />
      )}
    </div>
  );
}
