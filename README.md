# NutriAssist

Plataforma SaaS que fornece aos nutricionistas uma assistente virtual com IA (Nina) para automatizar agendamentos e responder dúvidas sobre dietas dos pacientes.

## Funcionalidades

- **Chat com IA (Nina)** - Assistente virtual em português brasileiro
- **Agendamento de Consultas** - Agendar, remarcar e cancelar consultas
- **Q&A de Dietas** - Upload de PDF e perguntas sobre o plano alimentar
- **FAQ Configurável** - Respostas automáticas para perguntas frequentes
- **Sistema de Handoff** - Encaminhamento para o nutricionista quando necessário
- **Dashboard Completo** - Gerenciamento de pacientes, conversas e agenda

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (PDFs)
- **LLM**: OpenRouter (Llama 3.1 8B)
- **Styling**: Tailwind CSS v4
- **Hosting**: Vercel

## URLs

| Ambiente | URL |
|----------|-----|
| Produção | https://nutriassist-one.vercel.app |
| Chat de Teste | https://nutriassist-one.vercel.app/chat/11111111-1111-1111-1111-111111111111 |
| Dashboard | https://nutriassist-one.vercel.app/dashboard |

## Começando

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase
- Conta no OpenRouter

### Instalação

```bash
# Clone o repositório
git clone https://github.com/gabrielramos-rc/nutriassist.git
cd nutriassist

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais
```

### Variáveis de Ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENROUTER_API_KEY=sk-or-v1-your_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Banco de Dados

Execute a migração inicial no SQL Editor do Supabase:

```bash
# O arquivo está em:
supabase/migrations/001_initial_schema.sql
```

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Build de produção
npm run build

# Lint
npm run lint
```

## Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── chat/              # Chat widget público
│   └── dashboard/         # Dashboard do nutricionista
├── components/            # Componentes React
│   ├── chat/             # Componentes do chat
│   ├── dashboard/        # Componentes do dashboard
│   └── ui/               # Componentes base (Button, Input, etc.)
├── services/             # Lógica de negócio
│   └── nina/             # Serviço da assistente Nina
├── lib/                  # Utilitários e clients
└── types/                # TypeScript types
```

## Documentação

- [CLAUDE.md](./CLAUDE.md) - Guia de desenvolvimento e convenções
- [ARCHITECTURE.md](./architecture.md) - Arquitetura do sistema
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guia de deploy
- [TASKS.md](./TASKS.md) - Lista de tarefas do projeto

## Roadmap

### MVP (v1.0.0) - Completo

- [x] Chat com Nina (IA)
- [x] Sistema de agendamento
- [x] Q&A de dietas com PDF
- [x] FAQ configurável
- [x] Sistema de handoff
- [x] Dashboard do nutricionista
- [x] Landing page

### Futuro

- [ ] Integração WhatsApp (Meta Business API)
- [ ] Integração Google Calendar
- [ ] Autenticação Supabase Auth
- [ ] Multi-tenant (múltiplos nutricionistas)
- [ ] Notificações por email/SMS

## Licença

Privado - Todos os direitos reservados.
