"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { User, Phone, Clock, CheckCircle } from "lucide-react";

interface BusinessHours {
  [key: string]: {
    start: string;
    end: string;
    enabled: boolean;
  };
}

const DAYS = [
  { key: "monday", label: "Segunda" },
  { key: "tuesday", label: "Terça" },
  { key: "wednesday", label: "Quarta" },
  { key: "thursday", label: "Quinta" },
  { key: "friday", label: "Sexta" },
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

export default function OnboardingPage() {
  const router = useRouter();
  const { success, error: showError } = useToast();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Step 1: Profile
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ name?: string }>({});

  // Step 2: Schedule
  const [appointmentDuration, setAppointmentDuration] = useState(60);
  const [businessHours, setBusinessHours] = useState<BusinessHours>(DEFAULT_BUSINESS_HOURS);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);

      // Check if nutritionist record already exists
      const { data: nutritionist } = await supabase
        .from("nutritionists")
        .select("id, name")
        .eq("id", user.id)
        .single();

      const nutri = nutritionist as { id: string; name: string } | null;
      if (nutri?.name && nutri.name !== "Novo Nutricionista") {
        // Already onboarded
        router.push("/dashboard");
        return;
      }

      // Pre-fill name from auth metadata
      if (user.user_metadata?.name) {
        setName(user.user_metadata.name);
      }

      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [router]);

  const validateStep1 = (): boolean => {
    const newErrors: { name?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Nome é obrigatório";
    } else if (name.trim().length < 2) {
      newErrors.name = "Nome deve ter pelo menos 2 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const updateBusinessHour = (
    day: string,
    field: "start" | "end" | "enabled",
    value: string | boolean
  ) => {
    setBusinessHours((prev) => {
      const current = prev[day] ?? { start: "08:00", end: "18:00", enabled: false };
      return {
        ...prev,
        [day]: {
          start: field === "start" ? (value as string) : current.start,
          end: field === "end" ? (value as string) : current.end,
          enabled: field === "enabled" ? (value as boolean) : current.enabled,
        },
      };
    });
  };

  const handleComplete = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      // Update nutritionist profile via API
      const res = await fetch("/api/nutritionists", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nutritionistId: userId,
          name: name.trim(),
          phone: phone.trim() || null,
          appointment_duration: appointmentDuration,
          business_hours: businessHours,
        }),
      });

      const error = !res.ok;

      if (error) {
        showError("Erro ao salvar perfil. Tente novamente.");
        return;
      }

      success("Perfil configurado com sucesso!");
      router.push("/dashboard");
    } catch {
      showError("Erro ao salvar perfil. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col">
      {/* Header */}
      <header className="p-4">
        <div className="inline-flex items-center gap-2 text-green-700">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <span className="font-semibold text-xl">NutriAssist</span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Progress */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    s <= step ? "bg-green-600" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>

            {/* Step 1: Profile */}
            {step === 1 && (
              <div>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-green-600" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">Seu perfil</h1>
                  <p className="text-gray-500 mt-2">Como seus pacientes vão te conhecer</p>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Nome completo"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors({});
                    }}
                    error={errors.name}
                    leftIcon={<User className="w-5 h-5" />}
                    placeholder="Seu nome"
                  />

                  <Input
                    label="Telefone (opcional)"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    leftIcon={<Phone className="w-5 h-5" />}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <Button onClick={handleNext} className="w-full mt-6" size="lg">
                  Continuar
                </Button>
              </div>
            )}

            {/* Step 2: Schedule */}
            {step === 2 && (
              <div>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-green-600" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">Horários</h1>
                  <p className="text-gray-500 mt-2">
                    Configure seus dias e horários de atendimento
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duração da consulta
                    </label>
                    <select
                      value={appointmentDuration}
                      onChange={(e) => setAppointmentDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value={30}>30 minutos</option>
                      <option value={45}>45 minutos</option>
                      <option value={60}>1 hora</option>
                      <option value={90}>1h30</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dias de atendimento
                    </label>
                    <div className="space-y-2">
                      {DAYS.map((day) => (
                        <label
                          key={day.key}
                          className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={businessHours[day.key]?.enabled || false}
                            onChange={(e) =>
                              updateBusinessHour(day.key, "enabled", e.target.checked)
                            }
                            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                          />
                          <span className="flex-1 font-medium text-gray-900">{day.label}</span>
                          {businessHours[day.key]?.enabled && (
                            <span className="text-sm text-gray-500">
                              {businessHours[day.key]?.start} - {businessHours[day.key]?.end}
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button onClick={handleBack} variant="outline" className="flex-1" size="lg">
                    Voltar
                  </Button>
                  <Button onClick={handleNext} className="flex-1" size="lg">
                    Continuar
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Complete */}
            {step === 3 && (
              <div>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">Tudo pronto!</h1>
                  <p className="text-gray-500 mt-2">Seu perfil está configurado</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nome</span>
                    <span className="font-medium text-gray-900">{name}</span>
                  </div>
                  {phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Telefone</span>
                      <span className="font-medium text-gray-900">{phone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Duração da consulta</span>
                    <span className="font-medium text-gray-900">{appointmentDuration} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Dias de atendimento</span>
                    <span className="font-medium text-gray-900">
                      {Object.entries(businessHours).filter(([, h]) => h.enabled).length} dias
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-500 text-center mb-6">
                  Você poderá ajustar essas configurações a qualquer momento nas configurações do
                  dashboard.
                </p>

                <div className="flex gap-3">
                  <Button onClick={handleBack} variant="outline" className="flex-1" size="lg">
                    Voltar
                  </Button>
                  <Button
                    onClick={handleComplete}
                    className="flex-1"
                    size="lg"
                    isLoading={isLoading}
                  >
                    Começar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
