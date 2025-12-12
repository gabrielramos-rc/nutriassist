"use client";

import { useState, useEffect, useCallback } from "react";
import { PatientList } from "@/components/dashboard/PatientList";
import { PatientModal } from "@/components/dashboard/PatientModal";
import { UploadDietModal } from "@/components/dashboard/UploadDietModal";

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
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedPatientIdForUpload, setSelectedPatientIdForUpload] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    try {
      const res = await fetch(`/api/patients?nutritionistId=${TEST_NUTRITIONIST_ID}`);
      const data = await res.json();
      setPatients(data);
    } catch {
      // Failed to fetch patients
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
    if (selectedPatient) {
      // Update existing patient
      await fetch("/api/patients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          ...data,
        }),
      });
    } else {
      // Create new patient
      await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nutritionistId: TEST_NUTRITIONIST_ID,
          ...data,
        }),
      });
    }

    await fetchPatients();
  };

  const handleDeletePatient = async (patientId: string) => {
    try {
      await fetch(`/api/patients?patientId=${patientId}`, {
        method: "DELETE",
      });
      await fetchPatients();
    } catch {
      // Failed to delete patient
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
