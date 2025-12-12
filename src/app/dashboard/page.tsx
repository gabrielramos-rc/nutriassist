export const dynamic = "force-dynamic";

import { MessageSquare, AlertCircle, Calendar, Users } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import {
  getActiveConversationCount,
  getHandoffCount,
  getConversations,
  getPendingHandoffs,
} from "@/services/conversations";
import { getTodayAppointments } from "@/services/appointments";
import { getPatientCount } from "@/services/patients";
import { formatTime, truncate } from "@/lib/utils";
import Link from "next/link";

const TEST_NUTRITIONIST_ID = "11111111-1111-1111-1111-111111111111";

export default async function DashboardPage() {
  // Fetch all stats in parallel
  const [
    activeConversations,
    pendingHandoffs,
    todayAppointments,
    patientCount,
    recentConversations,
    handoffs,
  ] = await Promise.all([
    getActiveConversationCount(TEST_NUTRITIONIST_ID),
    getHandoffCount(TEST_NUTRITIONIST_ID),
    getTodayAppointments(TEST_NUTRITIONIST_ID),
    getPatientCount(TEST_NUTRITIONIST_ID),
    getConversations(TEST_NUTRITIONIST_ID, { status: "active", limit: 5 }),
    getPendingHandoffs(TEST_NUTRITIONIST_ID),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Visão geral das suas atividades</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Conversas Ativas" value={activeConversations} icon={MessageSquare} />
        <StatsCard
          title="Aguardando Resposta"
          value={pendingHandoffs}
          icon={AlertCircle}
          className={pendingHandoffs > 0 ? "border-orange-200 bg-orange-50" : ""}
        />
        <StatsCard title="Consultas Hoje" value={todayAppointments.length} icon={Calendar} />
        <StatsCard title="Total de Pacientes" value={patientCount} icon={Users} />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Consultas de Hoje</h2>
            <Link
              href="/dashboard/appointments"
              className="text-sm text-green-600 hover:text-green-700"
            >
              Ver todas
            </Link>
          </div>

          {todayAppointments.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">Nenhuma consulta agendada para hoje</p>
          ) : (
            <ul className="space-y-3">
              {todayAppointments.map((apt) => (
                <li
                  key={apt.id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {(apt as unknown as { patients: { name: string } }).patients?.name ||
                        "Paciente"}
                    </p>
                    <p className="text-sm text-gray-500">{formatTime(apt.starts_at)}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    Agendado
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pending Handoffs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Aguardando Resposta</h2>
            <Link
              href="/dashboard/conversations"
              className="text-sm text-green-600 hover:text-green-700"
            >
              Ver conversas
            </Link>
          </div>

          {handoffs.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">Nenhuma conversa aguardando resposta</p>
          ) : (
            <ul className="space-y-3">
              {handoffs.slice(0, 5).map((handoff) => (
                <li key={handoff.id} className="py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {(handoff as unknown as { chat_sessions: { patients: { name: string } } })
                          .chat_sessions?.patients?.name || "Paciente"}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{truncate(handoff.reason, 50)}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                      Pendente
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recent Conversations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Conversas Recentes</h2>
          <Link
            href="/dashboard/conversations"
            className="text-sm text-green-600 hover:text-green-700"
          >
            Ver todas
          </Link>
        </div>

        {recentConversations.length === 0 ? (
          <p className="text-gray-500 text-sm py-4">Nenhuma conversa ativa no momento</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recentConversations.map((conv) => (
              <li key={conv.id} className="py-4 first:pt-0 last:pb-0">
                <Link
                  href={`/dashboard/conversations?session=${conv.id}`}
                  className="flex items-center justify-between hover:bg-gray-50 -mx-2 px-2 py-1 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-700 font-medium">
                        {((conv as unknown as { patients: { name: string } }).patients?.name || "P")
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {(conv as unknown as { patients: { name: string } }).patients?.name ||
                          "Paciente"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {conv.channel === "web" ? "Chat Web" : "WhatsApp"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      conv.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {conv.status === "active" ? "Ativa" : "Fechada"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
