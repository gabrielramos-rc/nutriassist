"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error: showError } = useToast();

  // Check if we have a recovery token in the URL (from email link)
  const [hasRecoveryToken, setHasRecoveryToken] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  useEffect(() => {
    // Check for recovery token in hash fragment
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      setHasRecoveryToken(true);
    }

    // Also check for error in URL params
    const error = searchParams.get("error");
    if (error) {
      showError(decodeURIComponent(error));
    }
  }, [searchParams, showError]);

  const validateEmail = (): boolean => {
    const newErrors: { email?: string } = {};

    if (!email) {
      newErrors.email = "E-mail é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "E-mail inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = (): boolean => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      newErrors.password = "Senha é obrigatória";
    } else if (password.length < 8) {
      newErrors.password = "Senha deve ter pelo menos 8 caracteres";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirme sua senha";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail()) return;

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        showError(error.message);
        return;
      }

      setEmailSent(true);
      success("E-mail enviado! Verifique sua caixa de entrada.");
    } catch {
      showError("Erro ao enviar e-mail. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword()) return;

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        showError(error.message);
        return;
      }

      success("Senha alterada com sucesso!");
      router.push("/dashboard");
    } catch {
      showError("Erro ao alterar senha. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show password reset form if we have a recovery token
  if (hasRecoveryToken) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Nova senha</h1>
            <p className="text-gray-500 mt-2">Digite sua nova senha</p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <Input
              label="Nova senha"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              error={errors.password}
              leftIcon={<Lock className="w-5 h-5" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
            />

            <Input
              label="Confirmar nova senha"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
              }}
              error={errors.confirmPassword}
              leftIcon={<Lock className="w-5 h-5" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="focus:outline-none"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              }
              placeholder="Repita a senha"
              autoComplete="new-password"
            />

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Salvar nova senha
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Show email sent confirmation
  if (emailSent) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">E-mail enviado</h1>
          <p className="text-gray-500 mb-6">
            Enviamos um link de recuperação para <strong>{email}</strong>. Verifique sua caixa de
            entrada.
          </p>
          <Button variant="outline" onClick={() => router.push("/login")} className="w-full">
            Voltar para login
          </Button>
        </div>
      </div>
    );
  }

  // Show request reset form
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para login
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Recuperar senha</h1>
          <p className="text-gray-500 mt-2">
            Digite seu e-mail para receber um link de recuperação
          </p>
        </div>

        <form onSubmit={handleRequestReset} className="space-y-4">
          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            error={errors.email}
            leftIcon={<Mail className="w-5 h-5" />}
            placeholder="seu@email.com"
            autoComplete="email"
          />

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            Enviar link de recuperação
          </Button>
        </form>
      </div>
    </div>
  );
}
