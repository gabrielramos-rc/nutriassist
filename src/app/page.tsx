import Link from "next/link";
import {
  MessageSquare,
  Calendar,
  FileText,
  Bot,
  Clock,
  Shield,
  ArrowRight,
  Check,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">NutriAssist</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">
                Recursos
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">
                Como funciona
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">
                Preços
              </a>
            </nav>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                Entrar
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Começar grátis
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 sm:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
              Sua assistente virtual para{" "}
              <span className="text-green-600">nutricionistas</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 leading-relaxed">
              Automatize agendamentos e responda dúvidas dos pacientes 24/7 com a Nina,
              sua assistente de IA especializada em nutrição.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-medium flex items-center justify-center gap-2"
              >
                Começar gratuitamente
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/chat/11111111-1111-1111-1111-111111111111"
                className="w-full sm:w-auto px-8 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-lg font-medium"
              >
                Ver demonstração
              </Link>
            </div>
          </div>

          {/* Hero Image/Preview */}
          <div className="mt-16 relative">
            <div className="bg-gradient-to-b from-green-50 to-white rounded-2xl p-8 border border-green-100">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-md mx-auto">
                <div className="bg-green-600 text-white px-4 py-3">
                  <p className="font-semibold">Nina</p>
                  <p className="text-sm text-green-100">Assistente Virtual</p>
                </div>
                <div className="p-4 space-y-3">
                  <div className="bg-green-100 rounded-2xl rounded-tl-sm px-4 py-2 max-w-[80%]">
                    <p className="text-sm text-gray-900">
                      Oi! Sou a Nina, assistente virtual. Posso te ajudar com agendamentos
                      e dúvidas sobre seu plano alimentar.
                    </p>
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%] ml-auto">
                    <p className="text-sm text-gray-900">
                      Quero marcar uma consulta
                    </p>
                  </div>
                  <div className="bg-green-100 rounded-2xl rounded-tl-sm px-4 py-2 max-w-[80%]">
                    <p className="text-sm text-gray-900">
                      Claro! Temos os seguintes horários disponíveis esta semana...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Tudo que você precisa para atender melhor
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Automatize tarefas repetitivas e foque no que importa: seus pacientes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Agendamento automático
              </h3>
              <p className="text-gray-600">
                Pacientes agendam, remarcam e cancelam consultas diretamente pelo chat,
                24 horas por dia.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Dúvidas sobre o plano
              </h3>
              <p className="text-gray-600">
                A Nina responde perguntas sobre o plano alimentar do paciente,
                com base no PDF que você enviou.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                FAQ personalizado
              </h3>
              <p className="text-gray-600">
                Configure respostas automáticas para perguntas frequentes sobre preço,
                localização e preparo.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Bot className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Handoff inteligente
              </h3>
              <p className="text-gray-600">
                Quando a Nina não consegue responder, ela encaminha a conversa para
                você responder manualmente.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Disponível 24/7
              </h3>
              <p className="text-gray-600">
                Atenda seus pacientes a qualquer hora, mesmo quando você não está
                disponível.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Seguro e confiável
              </h3>
              <p className="text-gray-600">
                A Nina nunca dá conselhos médicos. Perguntas complexas são sempre
                encaminhadas para você.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Como funciona
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Configure em minutos e comece a automatizar seu atendimento
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Configure seu perfil
              </h3>
              <p className="text-gray-600">
                Adicione seus horários de atendimento, preços e respostas para
                perguntas frequentes.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Cadastre seus pacientes
              </h3>
              <p className="text-gray-600">
                Adicione pacientes e faça upload dos planos alimentares em PDF
                para a Nina consultar.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Compartilhe o link
              </h3>
              <p className="text-gray-600">
                Envie o link do chat para seus pacientes e deixe a Nina cuidar
                do resto.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Simples e acessível
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Comece grátis, sem cartão de crédito
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-8 text-center border-b border-gray-100">
                <p className="text-sm font-medium text-green-600 uppercase tracking-wide">
                  MVP Gratuito
                </p>
                <p className="mt-4">
                  <span className="text-5xl font-bold text-gray-900">R$ 0</span>
                  <span className="text-gray-500">/mês</span>
                </p>
                <p className="mt-2 text-gray-500">
                  Durante a fase de testes
                </p>
              </div>
              <div className="p-8">
                <ul className="space-y-4">
                  {[
                    "Chat com IA ilimitado",
                    "Agendamento automático",
                    "Upload de planos em PDF",
                    "FAQ personalizado",
                    "Dashboard completo",
                    "Suporte por e-mail",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/dashboard"
                  className="mt-8 w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center font-medium flex items-center justify-center gap-2"
                >
                  Começar agora
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-green-600 rounded-2xl p-8 sm:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Pronto para automatizar seu atendimento?
            </h2>
            <p className="mt-4 text-xl text-green-100 max-w-2xl mx-auto">
              Junte-se a nutricionistas que já economizam horas por semana com a Nina.
            </p>
            <Link
              href="/dashboard"
              className="mt-8 inline-flex items-center gap-2 px-8 py-4 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors text-lg font-medium"
            >
              Criar conta gratuita
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">NutriAssist</span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2024 NutriAssist. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
