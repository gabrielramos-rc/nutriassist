"use client";

import { useState, useRef } from "react";
import { X, Upload, FileText, AlertCircle } from "lucide-react";

interface UploadDietModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  onUploadComplete: () => void;
}

export function UploadDietModal({
  isOpen,
  onClose,
  patientId,
  onUploadComplete,
}: UploadDietModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Validate file type
    if (selectedFile.type !== "application/pdf") {
      setError("Apenas arquivos PDF são permitidos");
      setFile(null);
      return;
    }

    // Validate file size (10MB max)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("O arquivo deve ter no máximo 10MB");
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("patientId", patientId);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao enviar arquivo");
      }

      onUploadComplete();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar arquivo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      // Simulate file input change
      const dt = new DataTransfer();
      dt.items.add(droppedFile);
      if (fileInputRef.current) {
        fileInputRef.current.files = dt.files;
        handleFileChange({ target: { files: dt.files } } as React.ChangeEvent<HTMLInputElement>);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Enviar Plano Alimentar
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            {file ? (
              <div className="flex flex-col items-center">
                <FileText className="w-12 h-12 text-green-600 mb-3" />
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                <p className="font-medium text-gray-900">
                  Arraste o PDF aqui ou clique para selecionar
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Máximo 10MB
                </p>
              </div>
            )}
          </div>

          <p className="text-sm text-gray-500">
            O texto do PDF será extraído automaticamente para que a Nina possa responder perguntas sobre o plano alimentar.
          </p>

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
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading ? "Enviando..." : "Enviar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
