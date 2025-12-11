# NutriAssist - Guia de Deploy

Este documento descreve o processo de deploy do NutriAssist para produção.

## Visão Geral

- **Hospedagem**: Vercel
- **Banco de Dados**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (PDFs)
- **LLM**: OpenRouter

---

## 1. Pré-requisitos

### 1.1 Contas Necessárias
- [Vercel](https://vercel.com) - Hospedagem
- [Supabase](https://supabase.com) - Banco de dados
- [OpenRouter](https://openrouter.ai) - API de LLM
- [GitHub](https://github.com) - Repositório

### 1.2 Repositório
O repositório deve estar no GitHub:
```
https://github.com/gabrielramos-rc/nutriassist
```

---

## 2. Configuração do Supabase

### 2.1 Criar Projeto
1. Acesse [app.supabase.com](https://app.supabase.com)
2. Crie um novo projeto
3. Escolha região próxima (ex: `sa-east-1` para Brasil)
4. Anote as credenciais:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

### 2.2 Executar Migrações
No SQL Editor do Supabase, execute:
```sql
-- Execute o arquivo: supabase/migrations/001_initial_schema.sql
```

### 2.3 Criar Storage Bucket
1. Vá em Storage > New Bucket
2. Nome: `diets`
3. Marque como público: **Não**
4. Permitir uploads: 10MB max

### 2.4 RLS para Produção
Quando implementar autenticação, execute:
```sql
-- Execute o arquivo: supabase/migrations/002_production_rls.sql
```

---

## 3. Configuração do OpenRouter

### 3.1 Obter API Key
1. Acesse [openrouter.ai](https://openrouter.ai)
2. Crie uma conta ou faça login
3. Vá em Settings > API Keys
4. Crie uma nova key
5. Anote: `OPENROUTER_API_KEY`

### 3.2 Modelo Utilizado
O MVP usa o modelo gratuito:
```
meta-llama/llama-3.1-8b-instruct:free
```

---

## 4. Deploy no Vercel

### 4.1 Conectar Repositório
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Add New Project"
3. Importe o repositório `nutriassist`
4. Framework preset: Next.js (auto-detectado)

### 4.2 Configurar Variáveis de Ambiente
Na aba Settings > Environment Variables, adicione:

| Variável | Valor | Ambientes |
|----------|-------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Production, Preview, Development |
| `OPENROUTER_API_KEY` | `sk-or-v1-...` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | `https://nutriassist-one.vercel.app` | Production |
| `NEXT_PUBLIC_APP_URL` | `https://nutriassist-xxx-preview.vercel.app` | Preview |

### 4.3 Configurar Branch de Produção
1. Settings > Git
2. Production Branch: `main`
3. Preview Branches: `dev`, `feature/*`

### 4.4 Build Settings
O `vercel.json` já configura:
- Região: `gru1` (São Paulo)
- Timeout de funções: 30 segundos
- Framework: Next.js

---

## 5. Domínio Customizado

### 5.1 Adicionar Domínio
1. Vercel > Settings > Domains
2. Adicione seu domínio (ex: `app.nutriassist.com.br`)
3. Configure os DNS:

```
Tipo: CNAME
Nome: app (ou @)
Valor: cname.vercel-dns.com
```

### 5.2 SSL
O Vercel provisiona SSL automaticamente via Let's Encrypt.

---

## 6. Monitoramento

### 6.1 Vercel Analytics
1. Project Settings > Analytics
2. Habilite Web Analytics
3. Adicione ao código (opcional para métricas detalhadas):
```tsx
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

// No final do body:
<Analytics />
```

### 6.2 Speed Insights
```tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

// No final do body:
<SpeedInsights />
```

### 6.3 Logs
- Vercel Dashboard > Logs
- Filtrar por Function, Edge, Build
- Configurar alertas para erros

### 6.4 Supabase Dashboard
- Monitor de queries no Database
- Logs de API e Auth
- Uso de storage

---

## 7. Backups

### 7.1 Supabase Backups
- Plano Pro: backups automáticos diários
- Plano Free: export manual via Dashboard

### 7.2 Backup Manual
```sql
-- No SQL Editor
COPY (SELECT * FROM nutritionists) TO STDOUT WITH CSV HEADER;
COPY (SELECT * FROM patients) TO STDOUT WITH CSV HEADER;
-- etc.
```

---

## 8. Checklist de Deploy

### Antes do Deploy
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Migrações de banco executadas
- [ ] Storage bucket criado
- [ ] Testes locais passando
- [ ] Build local sem erros (`npm run build`)

### Após o Deploy
- [ ] Verificar health check (landing page carrega)
- [ ] Testar chat widget com nutritionist ID de teste
- [ ] Verificar dashboard carrega corretamente
- [ ] Testar agendamento de consulta
- [ ] Verificar upload de PDF funciona
- [ ] Monitorar logs por erros

### Para Produção Completa
- [ ] Implementar autenticação Supabase Auth
- [ ] Executar migração de RLS (002_production_rls.sql)
- [ ] Configurar domínio customizado
- [ ] Habilitar Vercel Analytics
- [ ] Configurar alertas de erro
- [ ] Testar com dados reais

---

## 9. Troubleshooting

### Erro: "Invalid API Key"
- Verifique se `OPENROUTER_API_KEY` está correto
- Confirme que não há espaços extras

### Erro: "JWT expired"
- Verifique `SUPABASE_SERVICE_ROLE_KEY`
- Regenere a key se necessário

### Erro: "Function timeout"
- Aumente `maxDuration` no `vercel.json`
- Otimize queries lentas

### Build falha
```bash
# Teste localmente
npm run build

# Verifique tipos
npm run lint
```

---

## 10. URLs Importantes

| Recurso | URL |
|---------|-----|
| App (Produção) | https://nutriassist-one.vercel.app |
| Supabase Dashboard | https://app.supabase.com/project/xeckvimqbosmmzjivxjp |
| Vercel Dashboard | https://vercel.com/dashboard |
| GitHub Repo | https://github.com/gabrielramos-rc/nutriassist |
| Chat de Teste | https://nutriassist-one.vercel.app/chat/11111111-1111-1111-1111-111111111111 |

---

## Suporte

Para problemas de deploy, verifique:
1. Logs no Vercel Dashboard
2. Logs no Supabase Dashboard
3. Documentação oficial:
   - [Vercel Docs](https://vercel.com/docs)
   - [Supabase Docs](https://supabase.com/docs)
   - [Next.js Docs](https://nextjs.org/docs)
