"use client";

import { useState } from "react";
import { formatDate, formatPhone } from "@/lib/utils";
import {
  Search,
  Plus,
  FileText,
  Upload,
  MoreVertical,
  Trash2,
  Edit,
  Mail,
  Phone,
} from "lucide-react";

interface Patient {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  diet_pdf_url: string | null;
  created_at: string;
}

interface PatientListProps {
  patients: Patient[];
  onAddPatient: () => void;
  onEditPatient: (patient: Patient) => void;
  onDeletePatient: (patientId: string) => void;
  onUploadDiet: (patientId: string) => void;
  onViewDiet: (pdfUrl: string) => void;
}

export function PatientList({
  patients,
  onAddPatient,
  onEditPatient,
  onDeletePatient,
  onUploadDiet,
  onViewDiet,
}: PatientListProps) {
  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase()) ||
      p.phone?.includes(search)
  );

  return (
    <div className="space-y-4">
      {/* Header - stacks on mobile */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar paciente..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={onAddPatient}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Paciente
        </button>
      </div>

      {/* Content container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Mobile: Card layout */}
        <div className="md:hidden divide-y divide-gray-100">
          {filteredPatients.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              {search ? "Nenhum paciente encontrado" : "Nenhum paciente cadastrado"}
            </div>
          ) : (
            filteredPatients.map((patient) => (
              <div key={patient.id} className="p-4">
                {/* Patient header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-green-700 font-medium">
                        {patient.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{patient.name}</p>
                      <p className="text-xs text-gray-500">
                        Desde {formatDate(patient.created_at)}
                      </p>
                    </div>
                  </div>
                  {/* Actions dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === patient.id ? null : patient.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                    {openMenuId === patient.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                        <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                          <button
                            onClick={() => {
                              onEditPatient(patient);
                              setOpenMenuId(null);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Edit className="w-4 h-4" />
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              onUploadDiet(patient.id);
                              setOpenMenuId(null);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Upload className="w-4 h-4" />
                            {patient.diet_pdf_url ? "Atualizar PDF" : "Enviar PDF"}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Tem certeza que deseja excluir este paciente?")) {
                                onDeletePatient(patient.id);
                              }
                              setOpenMenuId(null);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Excluir
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Contact info */}
                <div className="space-y-1 text-sm mb-3">
                  {patient.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{patient.email}</span>
                    </div>
                  )}
                  {patient.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      {formatPhone(patient.phone)}
                    </div>
                  )}
                </div>

                {/* Diet PDF action */}
                <div className="pt-3 border-t border-gray-100">
                  {patient.diet_pdf_url ? (
                    <button
                      onClick={() => onViewDiet(patient.diet_pdf_url!)}
                      className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700"
                    >
                      <FileText className="w-4 h-4" />
                      Ver Plano Alimentar
                    </button>
                  ) : (
                    <button
                      onClick={() => onUploadDiet(patient.id)}
                      className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
                    >
                      <Upload className="w-4 h-4" />
                      Enviar Plano Alimentar
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop: Table */}
        <table className="w-full hidden md:table">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Paciente
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contato
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plano Alimentar
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Desde
              </th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  {search ? "Nenhum paciente encontrado" : "Nenhum paciente cadastrado"}
                </td>
              </tr>
            ) : (
              filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-green-700 font-medium">
                          {patient.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{patient.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {patient.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {patient.email}
                        </div>
                      )}
                      {patient.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          {formatPhone(patient.phone)}
                        </div>
                      )}
                      {!patient.email && !patient.phone && (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {patient.diet_pdf_url ? (
                      <button
                        onClick={() => onViewDiet(patient.diet_pdf_url!)}
                        className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700"
                      >
                        <FileText className="w-4 h-4" />
                        Ver PDF
                      </button>
                    ) : (
                      <button
                        onClick={() => onUploadDiet(patient.id)}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
                      >
                        <Upload className="w-4 h-4" />
                        Enviar PDF
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(patient.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === patient.id ? null : patient.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>

                      {openMenuId === patient.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                          <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                            <button
                              onClick={() => {
                                onEditPatient(patient);
                                setOpenMenuId(null);
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Edit className="w-4 h-4" />
                              Editar
                            </button>
                            <button
                              onClick={() => {
                                onUploadDiet(patient.id);
                                setOpenMenuId(null);
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Upload className="w-4 h-4" />
                              {patient.diet_pdf_url ? "Atualizar PDF" : "Enviar PDF"}
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("Tem certeza que deseja excluir este paciente?")) {
                                  onDeletePatient(patient.id);
                                }
                                setOpenMenuId(null);
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              Excluir
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
