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
- [ ] Página carrega sem erros no console
- [ ] Hero section exibe corretamente
- [ ] Imagens e ícones carregam
- [ ] Layout responsivo (mobile/tablet/desktop)

### 1.2 Navegação
- [ ] Links do header funcionam (scroll para seções)
- [ ] Botão "Começar Agora" redireciona para dashboard
- [ ] Botão "Ver Demo" redireciona para chat de teste
- [ ] Footer links funcionam

### 1.3 Conteúdo
- [ ] Textos em português brasileiro
- [ ] Seção de funcionalidades visível
- [ ] Seção "Como Funciona" visível
- [ ] Seção de preços visível

---

## 2. Chat Widget

### 2.1 Inicialização
- [ ] Chat carrega sem erros
- [ ] Nina envia mensagem de boas-vindas automaticamente
- [ ] Nome do nutricionista aparece no header
- [ ] Input de mensagem está habilitado

### 2.2 Fluxo de Saudação
- [ ] Enviar "Oi" → Nina responde com saudação
- [ ] Enviar "Bom dia" → Nina responde apropriadamente
- [ ] Enviar "Olá, tudo bem?" → Nina responde de forma amigável

### 2.3 Fluxo de Agendamento
- [ ] Enviar "Quero agendar uma consulta" → Nina mostra horários disponíveis
- [ ] Selecionar um horário → Nina confirma agendamento
- [ ] Enviar "Quero remarcar minha consulta" → Nina oferece novos horários
- [ ] Enviar "Quero cancelar minha consulta" → Nina confirma cancelamento
- [ ] Enviar "Qual meu próximo horário?" → Nina mostra próxima consulta

### 2.4 Fluxo de FAQ
- [ ] Enviar "Quanto custa a consulta?" → Nina responde com preço configurado
- [ ] Enviar "Onde fica o consultório?" → Nina responde com endereço
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
- [ ] Enviar "Qual o placar do jogo?" → Nina redireciona para nutrição
- [ ] Enviar "Me conta uma piada" → Nina redireciona educadamente
- [ ] Nina não engaja em conversas prolongadas off-topic

### 2.9 UI/UX do Chat
- [ ] Mensagens do paciente aparecem à direita (verde)
- [ ] Mensagens da Nina aparecem à esquerda (cinza)
- [ ] Auto-scroll funciona ao receber mensagem
- [ ] Loading indicator aparece enquanto Nina processa
- [ ] Enter envia mensagem
- [ ] Botão de enviar funciona
- [ ] Input desabilitado enquanto envia

---

## 3. Dashboard - Home

### 3.1 Carregamento
- [ ] Página carrega sem erros
- [ ] Sidebar navegação visível
- [ ] Stats cards carregam com números

### 3.2 Stats Cards
- [ ] "Conversas Ativas" mostra número correto
- [ ] "Handoffs Pendentes" mostra número correto
- [ ] "Consultas Hoje" mostra número correto
- [ ] "Total de Pacientes" mostra número correto

### 3.3 Navegação
- [ ] Clique em cada item do sidebar navega corretamente
- [ ] Logo clicável volta para home do dashboard
- [ ] Links rápidos nos cards funcionam

---

## 4. Dashboard - Conversas

### 4.1 Lista de Conversas
- [ ] Lista carrega conversas existentes
- [ ] Filtro por status funciona (ativas/fechadas)
- [ ] Conversas com handoff são destacadas
- [ ] Data/hora da última mensagem visível
- [ ] Nome do paciente (ou "Visitante") visível

### 4.2 Visualizar Conversa
- [ ] Clique em conversa abre detalhes
- [ ] Histórico de mensagens carrega
- [ ] Mensagens ordenadas cronologicamente
- [ ] Intent de cada mensagem visível (se disponível)

### 4.3 Responder como Nutricionista
- [ ] Campo de resposta visível
- [ ] Enviar resposta funciona
- [ ] Mensagem aparece como "nutritionist" (não "nina")
- [ ] Paciente vê resposta no chat widget

### 4.4 Resolver Handoff
- [ ] Botão "Resolver Handoff" visível em conversas com handoff
- [ ] Clique resolve o handoff
- [ ] Status atualiza para resolvido
- [ ] Contador de handoffs pendentes diminui

---

## 5. Dashboard - Pacientes

### 5.1 Lista de Pacientes
- [ ] Lista carrega pacientes existentes
- [ ] Busca por nome funciona
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
- [ ] Calendário carrega mês atual
- [ ] Navegação entre meses funciona
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
- [ ] Nome carrega corretamente
- [ ] Email carrega corretamente
- [ ] Telefone carrega corretamente
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
| Landing Page | 12 | - | - | 12 |
| Chat Widget | 32 | - | - | 32 |
| Dashboard Home | 10 | - | - | 10 |
| Dashboard Conversas | 13 | - | - | 13 |
| Dashboard Pacientes | 18 | - | - | 18 |
| Dashboard Agenda | 14 | - | - | 14 |
| Dashboard Config | 15 | - | - | 15 |
| Integração | 8 | - | - | 8 |
| Performance | 5 | - | - | 5 |
| Erros | 8 | - | - | 8 |
| Acessibilidade | 10 | - | - | 10 |
| **TOTAL** | **145** | **-** | **-** | **145** |

---

## Notas

- Testes devem ser executados em Chrome, Firefox e Safari
- Testar em dispositivos móveis (iOS e Android)
- Registrar screenshots de bugs encontrados
- Atualizar esta tabela conforme testes são executados
