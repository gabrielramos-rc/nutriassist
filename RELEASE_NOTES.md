# NutriAssist - Release Notes

## beta-v0.2.0 (12 de Dezembro de 2025)

### Destaques

Esta versão traz melhorias significativas em **segurança**, **acessibilidade** e **experiência mobile**, preparando o NutriAssist para uso em produção.

---

### Novidades

#### Acesse de Qualquer Dispositivo

- Layout responsivo para celular, tablet e desktop
- Chat widget otimizado para telas menores
- Dashboard adaptativo com navegação mobile-friendly
- Elementos touch-friendly para melhor usabilidade em dispositivos móveis

#### Acessibilidade Aprimorada

- Navegação completa por teclado
- Suporte a leitores de tela (ARIA labels)
- Indicadores visuais de foco
- Links de atalho para conteúdo principal

#### Mensagens de Erro Claras

- Erros exibidos em português de forma amigável
- Retry automático em caso de falha de conexão
- Degradação graciosa quando APIs não respondem

---

### Correções

#### Chat com Nina

- **Respostas em tempo real** - Paciente vê respostas do nutricionista instantaneamente
- **Botões de resposta rápida** - Seleção de horários funciona corretamente
- **Fluxo de agendamento** - Conversa multi-turno para marcar consultas funciona sem interrupções
- **Perguntas sobre preço** - "Quanto custa a consulta?" agora responde corretamente

#### Dashboard do Nutricionista

- **Atualizações em tempo real** - Novas mensagens aparecem sem precisar atualizar a página
- **Notas de consulta** - Campo de observações editável no modal de agendamento
- **Validação de perfil** - Campos obrigatórios marcados com asterisco

---

### Melhorias Técnicas

#### Segurança

- Headers de segurança HTTP (proteção contra XSS, clickjacking)
- Validação de entrada em todas as APIs
- Rate limiting para proteção contra abuso
- Detecção automática de vulnerabilidades em dependências

#### Qualidade

- 209 testes automatizados
- Formatação de código consistente
- Verificações automáticas antes de cada commit

---

### Limitações Conhecidas

- Dashboard sem autenticação (acesso público)
- Sessões de chat anônimas (não persistem entre dispositivos)
- Criação manual de agendamentos não disponível no dashboard

---

### Próximas Versões

| Versão      | Foco                                        |
| ----------- | ------------------------------------------- |
| beta-v0.5.0 | Autenticação de nutricionistas              |
| beta-v0.6.0 | Integração WhatsApp e Google Calendar       |
| v1.0.0      | Multi-nutricionistas e planos de assinatura |

---

### Links

- **App**: https://nutriassist-one.vercel.app
- **Repositório**: https://github.com/gabrielramos-rc/nutriassist
