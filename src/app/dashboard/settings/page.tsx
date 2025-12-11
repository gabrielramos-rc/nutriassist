"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Save, Copy, Check, ExternalLink } from "lucide-react";

const TEST_NUTRITIONIST_ID = "11111111-1111-1111-1111-111111111111";

interface BusinessHours {
  [key: string]: {
    start: string;
    end: string;
    enabled: boolean;
  };
}

interface FAQResponses {
  price?: string;
  location?: string;
  preparation?: string;
  duration?: string;
  online?: string;
}

interface Nutritionist {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  business_hours: BusinessHours;
  appointment_duration: number;
  faq_responses: FAQResponses;
}

const DAYS = [
  { key: "monday", label: "Segunda-feira" },
  { key: "tuesday", label: "Terça-feira" },
  { key: "wednesday", label: "Quarta-feira" },
  { key: "thursday", label: "Quinta-feira" },
  { key: "friday", label: "Sexta-feira" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
];

const DEFAULT_BUSINESS_HOURS: BusinessHours = {
  monday: { start: "08:00", end: "18:00", enabled: true },
  tuesday: { start: "08:00", end: "18:00", enabled: true },
  wednesday: { start: "08:00", end: "18:00", enabled: true },
  thursday: { start: "08:00", end: "18:00", enabled: true },
  friday: { start: "08:00", end: "18:00", enabled: true },
  saturday: { start: "08:00", end: "12:00", enabled: false },
  sunday: { start: "08:00", end: "12:00", enabled: false },
};

export default function SettingsPage() {
  const [nutritionist, setNutritionist] = useState<Nutritionist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "schedule" | "faq" | "embed">("profile");
  const [copied, setCopied] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [appointmentDuration, setAppointmentDuration] = useState(60);
  const [businessHours, setBusinessHours] = useState<BusinessHours>(DEFAULT_BUSINESS_HOURS);
  const [faqResponses, setFaqResponses] = useState<FAQResponses>({});

  const fetchNutritionist = useCallback(async () => {
    try {
      const res = await fetch(`/api/nutritionists?nutritionistId=${TEST_NUTRITIONIST_ID}`);
      const data = await res.json();
      setNutritionist(data);

      // Populate form
      setName(data.name);
      setEmail(data.email);
      setPhone(data.phone || "");
      setAppointmentDuration(data.appointment_duration || 60);
      setBusinessHours(data.business_hours || DEFAULT_BUSINESS_HOURS);
      setFaqResponses(data.faq_responses || {});
    } catch (error) {
      console.error("Error fetching nutritionist:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNutritionist();
  }, [fetchNutritionist]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch("/api/nutritionists", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nutritionistId: TEST_NUTRITIONIST_ID,
          name,
          email,
          phone: phone || null,
          appointment_duration: appointmentDuration,
          business_hours: businessHours,
          faq_responses: faqResponses,
        }),
      });
      await fetchNutritionist();
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyEmbed = async () => {
    const chatUrl = `${window.location.origin}/chat/${TEST_NUTRITIONIST_ID}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(chatUrl);
      } else {
        // Fallback for non-HTTPS contexts
        const textArea = document.createElement("textarea");
        textArea.value = chatUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const updateBusinessHour = (day: string, field: "start" | "end" | "enabled", value: string | boolean) => {
    setBusinessHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-500 mt-1">
            Gerencie seu perfil e preferências
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Salvando..." : "Salvar"}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {[
            { id: "profile", label: "Perfil" },
            { id: "schedule", label: "Horários" },
            { id: "faq", label: "FAQ" },
            { id: "embed", label: "Chat Widget" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "pb-4 text-sm font-medium border-b-2 -mb-px transition-colors",
                activeTab === tab.id
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="(11) 99999-9999"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duração da consulta (minutos)
            </label>
            <select
              value={appointmentDuration}
              onChange={(e) => setAppointmentDuration(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value={30}>30 minutos</option>
              <option value={45}>45 minutos</option>
              <option value={60}>1 hora</option>
              <option value={90}>1h30</option>
              <option value={120}>2 horas</option>
            </select>
          </div>
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === "schedule" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">
          <p className="text-sm text-gray-500 mb-6">
            Configure seus horários de atendimento. A Nina usará esses horários para oferecer opções de agendamento.
          </p>

          <div className="space-y-4">
            {DAYS.map((day) => (
              <div
                key={day.key}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg border",
                  businessHours[day.key]?.enabled
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200 bg-gray-50"
                )}
              >
                <label className="flex items-center gap-3 min-w-[160px]">
                  <input
                    type="checkbox"
                    checked={businessHours[day.key]?.enabled || false}
                    onChange={(e) =>
                      updateBusinessHour(day.key, "enabled", e.target.checked)
                    }
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className="font-medium text-gray-900">{day.label}</span>
                </label>

                {businessHours[day.key]?.enabled && (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time"
                      value={businessHours[day.key]?.start || "08:00"}
                      onChange={(e) =>
                        updateBusinessHour(day.key, "start", e.target.value)
                      }
                      className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <span className="text-gray-500">até</span>
                    <input
                      type="time"
                      value={businessHours[day.key]?.end || "18:00"}
                      onChange={(e) =>
                        updateBusinessHour(day.key, "end", e.target.value)
                      }
                      className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ Tab */}
      {activeTab === "faq" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6 max-w-2xl">
          <p className="text-sm text-gray-500 mb-6">
            Configure as respostas automáticas da Nina para perguntas frequentes.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preço / Valor da consulta
            </label>
            <textarea
              value={faqResponses.price || ""}
              onChange={(e) =>
                setFaqResponses((prev) => ({ ...prev, price: e.target.value }))
              }
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ex: A consulta custa R$ 200,00 e pode ser parcelada em até 3x."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endereço / Localização
            </label>
            <textarea
              value={faqResponses.location || ""}
              onChange={(e) =>
                setFaqResponses((prev) => ({ ...prev, location: e.target.value }))
              }
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ex: Atendo na Rua das Flores, 123 - Centro, São Paulo."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preparo para consulta
            </label>
            <textarea
              value={faqResponses.preparation || ""}
              onChange={(e) =>
                setFaqResponses((prev) => ({ ...prev, preparation: e.target.value }))
              }
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ex: Venha de jejum de 8 horas e traga seus exames recentes."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duração da consulta
            </label>
            <textarea
              value={faqResponses.duration || ""}
              onChange={(e) =>
                setFaqResponses((prev) => ({ ...prev, duration: e.target.value }))
              }
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ex: A primeira consulta dura cerca de 1 hora. Retornos duram 30 minutos."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Atendimento Online
            </label>
            <textarea
              value={faqResponses.online || ""}
              onChange={(e) =>
                setFaqResponses((prev) => ({ ...prev, online: e.target.value }))
              }
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ex: Sim, atendo online via Google Meet. O link é enviado por e-mail."
            />
          </div>
        </div>
      )}

      {/* Embed Tab */}
      {activeTab === "embed" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Link do Chat
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Compartilhe este link com seus pacientes para que eles possam conversar com a Nina.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/chat/${TEST_NUTRITIONIST_ID}`}
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700"
              />
              <button
                onClick={handleCopyEmbed}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Testar Chat
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Abra o chat em uma nova aba para testar a experiência do paciente.
            </p>

            <a
              href={`/chat/${TEST_NUTRITIONIST_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Abrir Chat
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
