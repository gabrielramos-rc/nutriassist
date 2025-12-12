"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center">
            <div
              className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{
                width: "96px",
                height: "96px",
                backgroundColor: "#fee2e2",
                borderRadius: "9999px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              <AlertTriangle
                className="w-12 h-12 text-red-600"
                style={{ width: "48px", height: "48px", color: "#dc2626" }}
              />
            </div>
            <h1
              className="text-2xl font-bold text-gray-900 mb-2"
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#111827",
                marginBottom: "8px",
              }}
            >
              Erro critico
            </h1>
            <p
              className="text-gray-500 mb-8 max-w-md"
              style={{
                color: "#6b7280",
                marginBottom: "32px",
                maxWidth: "448px",
              }}
            >
              Ocorreu um erro critico na aplicacao. Por favor, recarregue a pagina.
            </p>
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "12px 24px",
                backgroundColor: "#16a34a",
                color: "white",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
              }}
            >
              <RefreshCw className="w-5 h-5" style={{ width: "20px", height: "20px" }} />
              Recarregar pagina
            </button>
            {process.env.NODE_ENV === "development" && (
              <pre
                className="mt-8 p-4 bg-gray-100 rounded-lg text-left text-sm text-red-600 max-w-xl mx-auto overflow-auto"
                style={{
                  marginTop: "32px",
                  padding: "16px",
                  backgroundColor: "#f3f4f6",
                  borderRadius: "8px",
                  textAlign: "left",
                  fontSize: "14px",
                  color: "#dc2626",
                  maxWidth: "576px",
                  margin: "32px auto 0",
                  overflow: "auto",
                }}
              >
                {error.message}
              </pre>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
