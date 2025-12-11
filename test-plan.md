# NutriAssist - Plano de Testes

Este documento descreve os testes manuais e automatizados para validar o funcionamento do NutriAssist.

## URLs de Teste

| Página | URL |
|--------|-----|
| Landing Page | https://nutriassist-one.vercel.app |
| Chat Widget | https://nutriassist-one.vercel.app/chat/11111111-1111-1111-1111-111111111111 |
| Dashboard | https://nutriassist-one.vercel.app/dashboard |
| Dashboard - Conversas | https://nutriassist-one.vercel.app/dashboard/conversations |
| Dashboard - Pacientes | https://nutriassist-one.vercel.app/dashboard/patients |
| Dashboard - Agenda | https://nutriassist-one.vercel.app/dashboard/appointments |
| Dashboard - Configurações | https://nutriassist-one.vercel.app/dashboard/settings |

## Dados de Teste

- **Nutritionist ID**: `11111111-1111-1111-1111-111111111111`
- **Patient ID**: `22222222-2222-2222-2222-222222222222`

---

## 1. Landing Page

### 1.1 Carregamento
- [x] Página carrega sem erros no console
- [x] Hero section exibe corretamente
- [x] Imagens e ícones carregam
- [ ] Layout responsivo (mobile/tablet/desktop)

### 1.2 Navegação
- [x] Links do header funcionam (scroll para seções)
- [x] Botão "Começar Agora" redireciona para dashboard
- [x] Botão "Ver Demo" redireciona para chat de teste
- [ ] Footer links funcionam

### 1.3 Conteúdo
- [x] Textos em português brasileiro
- [x] Seção de funcionalidades visível
- [x] Seção "Como Funciona" visível
- [x] Seção de preços visível

---

## 2. Chat Widget

### 2.1 Inicialização
- [x] Chat carrega sem erros
- [x] Nina envia mensagem de boas-vindas automaticamente
- [x] Nome do nutricionista aparece no header
- [x] Input de mensagem está habilitado

### 2.2 Fluxo de Saudação
- [x] Enviar "Oi" → Nina responde com saudação
- [ ] Enviar "Bom dia" → Nina responde apropriadamente
- [ ] Enviar "Olá, tudo bem?" → Nina responde de forma amigável

### 2.3 Fluxo de Agendamento
- [x] Enviar "Quero agendar uma consulta" → Nina mostra horários disponíveis
- [ ] Selecionar um horário → Nina confirma agendamento
- [ ] Enviar "Quero remarcar minha consulta" → Nina oferece novos horários
- [ ] Enviar "Quero cancelar minha consulta" → Nina confirma cancelamento
- [ ] Enviar "Qual meu próximo horário?" → Nina mostra próxima consulta

### 2.4 Fluxo de FAQ
- [ ] Enviar "Quanto custa a consulta?" → Nina responde com preço configurado ⚠️ (respondeu com agendamento em vez de preço)
- [x] Enviar "Onde fica o consultório?" → Nina responde com endereço
- [ ] Enviar "Como me preparar para a consulta?" → Nina dá instruções
- [ ] Enviar "Quanto tempo dura a consulta?" → Nina responde duração
- [ ] Enviar "Você atende online?" → Nina responde sobre consulta online

### 2.5 Fluxo de Diet Q&A (requer paciente com dieta)
- [ ] Enviar "O que posso comer no café da manhã?" → Nina responde com base no PDF
- [ ] Enviar "Posso trocar frango por peixe?" → Nina verifica substituições
- [ ] Enviar "Quantas calorias tem minha dieta?" → Nina busca no plano
- [ ] Pergunta não encontrada no PDF → Nina sugere handoff

### 2.6 Fluxo de Handoff
- [ ] Enviar "Estou sentindo dor de estômago" → Nina cria handoff (sintoma médico)
- [ ] Enviar "Quero falar com a nutricionista" → Nina cria handoff
- [ ] Enviar "Tenho uma reclamação" → Nina cria handoff
- [ ] Verificar que handoff aparece no dashboard

### 2.7 Guardrails (Conteúdo Bloqueado)
- [ ] Enviar mensagem sobre drogas → Nina bloqueia educadamente
- [ ] Enviar mensagem sobre armas → Nina bloqueia
- [ ] Enviar mensagem sobre auto-lesão → Nina bloqueia
- [ ] Nina redireciona para tópicos de nutrição

### 2.8 Off-topic
- [x] Enviar "Qual o placar do jogo?" → Nina redireciona para nutrição
- [ ] Enviar "Me conta uma piada" → Nina redireciona educadamente
- [ ] Nina não engaja em conversas prolongadas off-topic

### 2.9 UI/UX do Chat
- [x] Mensagens do paciente aparecem à direita (verde)
- [x] Mensagens da Nina aparecem à esquerda (cinza)
- [x] Auto-scroll funciona ao receber mensagem
- [ ] Loading indicator aparece enquanto Nina processa
- [x] Enter envia mensagem
- [ ] Botão de enviar funciona
- [ ] Input desabilitado enquanto envia

---

## 3. Dashboard - Home

### 3.1 Carregamento
- [x] Página carrega sem erros
- [x] Sidebar navegação visível
- [x] Stats cards carregam com números

### 3.2 Stats Cards
- [x] "Conversas Ativas" mostra número correto
- [x] "Handoffs Pendentes" mostra número correto
- [x] "Consultas Hoje" mostra número correto
- [x] "Total de Pacientes" mostra número correto

### 3.3 Navegação
- [x] Clique em cada item do sidebar navega corretamente
- [ ] Logo clicável volta para home do dashboard
- [x] Links rápidos nos cards funcionam

---

## 4. Dashboard - Conversas

### 4.1 Lista de Conversas
- [x] Lista carrega conversas existentes
- [x] Filtro por status funciona (ativas/fechadas)
- [x] Conversas com handoff são destacadas (orange indicator)
- [x] Data/hora da última mensagem visível
- [x] Nome do paciente (ou "Visitante") visível

### 4.2 Visualizar Conversa
- [x] Clique em conversa abre detalhes
- [x] Histórico de mensagens carrega
- [x] Mensagens ordenadas cronologicamente
- [x] Intent de cada mensagem visível (handoff reasons in sidebar)

### 4.3 Responder como Nutricionista
- [x] Campo de resposta visível
- [x] Enviar resposta funciona (BUG FIXED: message limit query order was cutting off newest messages)
- [x] Mensagem aparece como "nutritionist" (não "nina")
- [ ] Paciente vê resposta no chat widget

### 4.4 Resolver Handoff
- [x] Botão "Resolver Handoff" visível em conversas com handoff
- [x] Clique resolve o handoff
- [x] Status atualiza para resolvido (handoff removed from list)
- [ ] Contador de handoffs pendentes diminui

---

## 5. Dashboard - Pacientes

### 5.1 Lista de Pacientes
- [x] Lista carrega pacientes existentes
- [x] Busca por nome funciona
- [ ] Busca por email funciona
- [ ] Busca por telefone funciona

### 5.2 Adicionar Paciente
- [ ] Botão "Novo Paciente" abre modal
- [ ] Campos obrigatórios validados (nome)
- [ ] Email validado (formato)
- [ ] Telefone aceita formato brasileiro
- [ ] Salvar cria paciente
- [ ] Paciente aparece na lista

### 5.3 Editar Paciente
- [ ] Clique em paciente abre modal de edição
- [ ] Dados carregam corretamente
- [ ] Alterações são salvas
- [ ] Lista atualiza após salvar

### 5.4 Excluir Paciente
- [ ] Botão excluir visível
- [ ] Confirmação antes de excluir
- [ ] Paciente removido da lista
- [ ] Dados relacionados tratados (cascade)

### 5.5 Upload de Dieta (PDF)
- [ ] Botão "Upload Dieta" visível
- [ ] Aceita apenas arquivos PDF
- [ ] Rejeita arquivos > 10MB
- [ ] Progress indicator durante upload
- [ ] Sucesso mostra confirmação
- [ ] PDF URL salvo no paciente
- [ ] Texto extraído salvo no paciente

### 5.6 Visualizar/Download Dieta
- [ ] Botão "Ver Dieta" visível se PDF existe
- [ ] Clique abre/baixa o PDF
- [ ] Funciona em nova aba

---

## 6. Dashboard - Agenda

### 6.1 Visualização Calendário
- [x] Calendário carrega mês atual
- [x] Navegação entre meses funciona
- [ ] Consultas aparecem nos dias corretos
- [ ] Cores diferentes por status (agendado/concluído/cancelado)

### 6.2 Visualização Lista
- [ ] Toggle para visualização lista funciona
- [ ] Lista ordenada por data
- [ ] Filtro por status funciona
- [ ] Informações do paciente visíveis

### 6.3 Detalhes da Consulta
- [ ] Clique em consulta abre modal
- [ ] Nome do paciente visível
- [ ] Data e horário visíveis
- [ ] Status visível
- [ ] Notas visíveis (se houver)

### 6.4 Editar Consulta
- [ ] Alterar status funciona (concluída/no-show)
- [ ] Adicionar notas funciona
- [ ] Salvar atualiza a consulta

### 6.5 Cancelar Consulta
- [ ] Botão cancelar visível
- [ ] Confirmação antes de cancelar
- [ ] Status atualiza para "cancelled"
- [ ] Consulta aparece com estilo de cancelada

---

## 7. Dashboard - Configurações

### 7.1 Perfil do Nutricionista
- [x] Nome carrega corretamente
- [x] Email carrega corretamente
- [x] Telefone carrega corretamente
- [ ] Editar e salvar funciona
- [ ] Validações funcionam

### 7.2 Horário de Atendimento
- [ ] Dias da semana listados
- [ ] Horário inicial/final editável
- [ ] Toggle ativar/desativar dia funciona
- [ ] Salvar persiste alterações
- [ ] Horários refletem no agendamento

### 7.3 Duração da Consulta
- [ ] Duração atual exibida
- [ ] Editar duração funciona
- [ ] Afeta slots de agendamento

### 7.4 Respostas FAQ
- [ ] FAQs existentes listados
- [ ] Editar resposta funciona
- [ ] Salvar persiste alterações
- [ ] Respostas refletem no chat

### 7.5 Código de Incorporação
- [ ] Código do widget exibido
- [ ] Botão copiar funciona
- [ ] Código contém nutritionist ID correto
- [ ] Instruções de uso visíveis

---

## 8. Testes de Integração

### 8.1 Chat → Dashboard
- [ ] Mensagem enviada no chat aparece em Conversas
- [ ] Handoff criado no chat aparece como pendente
- [ ] Resposta do nutricionista chega no chat

### 8.2 Agendamento End-to-End
- [ ] Paciente agenda via chat
- [ ] Consulta aparece na agenda do dashboard
- [ ] Nutricionista cancela no dashboard
- [ ] Paciente vê cancelamento (próxima interação)

### 8.3 Dieta End-to-End
- [ ] Nutricionista faz upload de PDF
- [ ] Paciente faz pergunta sobre dieta
- [ ] Nina responde com informação do PDF

---

## 9. Testes de Performance

### 9.1 Tempo de Carregamento
- [ ] Landing page < 3s
- [ ] Chat widget < 2s
- [ ] Dashboard < 3s
- [ ] Resposta da Nina < 5s

### 9.2 Mobile Performance
- [ ] Lighthouse score > 80 (mobile)
- [ ] Sem layout shifts visíveis
- [ ] Touch targets adequados

---

## 10. Testes de Erro

### 10.1 Erros de Rede
- [ ] Chat mostra erro se API falhar
- [ ] Dashboard mostra erro se dados não carregarem
- [ ] Retry automático ou manual disponível

### 10.2 Erros de Validação
- [ ] Formulários mostram erros claros
- [ ] Campos inválidos destacados
- [ ] Mensagens em português

### 10.3 404 / Páginas Inexistentes
- [ ] URL inválida mostra página 404
- [ ] Chat com nutritionist ID inválido mostra erro
- [ ] Links para navegação de volta

---

## 11. Testes de Acessibilidade

### 11.1 Navegação por Teclado
- [ ] Tab navega entre elementos
- [ ] Enter ativa botões/links
- [ ] Escape fecha modais
- [ ] Focus visível em todos elementos

### 11.2 Screen Reader
- [ ] Imagens têm alt text
- [ ] Formulários têm labels
- [ ] Botões têm texto descritivo
- [ ] Estrutura de headings correta

### 11.3 Contraste
- [ ] Texto legível em todos backgrounds
- [ ] Links distinguíveis
- [ ] Estados de erro visíveis

---

## Resultado dos Testes

| Categoria | Total | Passou | Falhou | Pendente |
|-----------|-------|--------|--------|----------|
| Landing Page | 12 | 10 | 0 | 2 |
| Chat Widget | 32 | 11 | 1 | 20 |
| Dashboard Home | 10 | 9 | 0 | 1 |
| Dashboard Conversas | 13 | 10 | 1 | 2 |
| Dashboard Pacientes | 18 | 2 | 0 | 16 |
| Dashboard Agenda | 14 | 2 | 0 | 12 |
| Dashboard Config | 15 | 3 | 0 | 12 |
| Integração | 8 | 0 | 0 | 8 |
| Performance | 5 | 0 | 0 | 5 |
| Erros | 8 | 0 | 0 | 8 |
| Acessibilidade | 10 | 0 | 0 | 10 |
| **TOTAL** | **145** | **47** | **2** | **96** |

---

## Notas

- Testes devem ser executados em Chrome, Firefox e Safari
- Testar em dispositivos móveis (iOS e Android)
- Registrar screenshots de bugs encontrados
- Atualizar esta tabela conforme testes são executados

---

## Execução de Testes - 2025-12-11

### Ambiente de Teste
- **Browser**: Chromium (Playwright)
- **Ferramenta**: Claude Code com Playwright MCP
- **URL Base**: https://nutriassist-one.vercel.app

### Resumo da Execução
- **Data/Hora**: 2025-12-11 14:02-14:06 UTC
- **Testes Executados**: 42
- **Passaram**: 41
- **Falharam**: 1

### Bug Encontrado

#### FAQ Intent Classification Issue
- **Teste**: "Quanto custa a consulta?" → Nina responde com preço configurado
- **Resultado**: Nina respondeu com horários de agendamento em vez de informações de preço
- **Severidade**: Média
- **Descrição**: A classificação de intent está incorretamente identificando perguntas sobre preço como intenção de agendamento
- **Screenshot**: test-screenshots/04-chat-faq-price-response.png

### Screenshots Capturados
1. `01-landing-page.png` - Landing page completa
2. `02-chat-welcome.png` - Mensagem de boas-vindas da Nina
3. `03-chat-greeting-response.png` - Resposta ao "Oi"
4. `04-chat-faq-price-response.png` - Resposta FAQ preço (BUG)
5. `05-chat-faq-location-response.png` - Resposta FAQ localização
6. `06-chat-scheduling-slots.png` - Horários de agendamento
7. `07-chat-guardrails-offtopic.png` - Guardrail off-topic
8. `08-dashboard-main.png` - Dashboard principal
9. `09-dashboard-conversations.png` - Lista de conversas
10. `10-dashboard-patients.png` - Lista de pacientes
11. `11-dashboard-appointments.png` - Calendário de agenda
12. `12-dashboard-settings.png` - Configurações

---

## Phase 12 - Dashboard Conversations Tests (2025-12-11)

### Ambiente de Teste
- **Browser**: Chromium (Playwright MCP)
- **Ferramenta**: Claude Code
- **URL Base**: https://nutriassist-one.vercel.app/dashboard/conversations

### Resumo da Execução
- **Testes Executados**: 9
- **Passaram**: 8
- **Falharam**: 1 (nutricionista reply not appearing in history)

### Testes Phase 12.1 - Lista de Conversas (5/5 ✅)
1. ✅ Lista carrega conversas existentes
2. ✅ Filtro por status funciona (Todas/Ativas/Pendentes tabs)
3. ✅ Conversas com handoff são destacadas (orange indicator next to patient name)
4. ✅ Data/hora da última mensagem visível
5. ✅ Nome do paciente visível

### Testes Phase 12.2 - Resposta Nutricionista (1/2 ⚠️)
1. ✅ Campo de resposta visível ("Digite sua resposta..." textbox)
2. ⚠️ Enviar resposta - Input clears after clicking send, but message does not appear in conversation history

### Testes Phase 12.3 - Gerenciar Handoff (2/2 ✅)
1. ✅ Botão "Marcar como respondido" visível para cada handoff pendente
2. ✅ Clique no botão remove o handoff da lista de pendentes

### Bug Encontrado

#### Nutritionist Reply Not Visible
- **Teste**: Enviar resposta como nutricionista
- **Resultado**: Input field clears after clicking "Enviar" but message does not appear in conversation history
- **Severidade**: Média
- **Descrição**: The reply functionality UI exists and the input clears (suggesting the API was called), but the message is not reflected in the conversation history. May need real-time updates or page refresh to see new messages.

### Screenshots Phase 12
1. `phase12-01-conversations-page.png` - Lista de conversas
2. `phase12-02-conversation-details.png` - Detalhes da conversa com histórico
3. `phase12-04-handoff-panel.png` - Painel de handoffs pendentes
4. `phase12-05-after-resolve-handoff.png` - Após resolver um handoff
