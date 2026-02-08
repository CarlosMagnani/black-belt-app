# Épico: Sistema de Pagamentos

> Integração com Efí Bank para cobrança de academias e processamento de mensalidades de alunos

## Resumo

**Objetivo:** Permitir que o BlackBelt cobre assinaturas das academias e que academias cobrem mensalidades dos alunos via PIX recorrente automatizado.

**Fase:** Pós-MVP (Sprint 8+)

**Prioridade:** Alta (monetização do produto)

**Dependências:**
- Sprint 7 (Painel Owner/Professor) — academias precisam estar funcionando
- Aprovação comercial da Efí Bank para API de Abertura de Contas

---

## Contexto

O BlackBelt precisa de duas fontes de receita:

1. **B2B:** Assinatura mensal das academias para usar a plataforma
2. **Facilitação:** Academias cobram alunos diretamente pelo app (PIX recorrente)

O modelo escolhido usa **Efí Bank** como provedor único, permitindo:
- Criar contas automaticamente para cada academia (API Abertura de Contas)
- Split de pagamento (BlackBelt pode cobrar % sobre transações)
- PIX Automático (débito recorrente sem ação do aluno)

---

## Escopo

### Inclui
- Cobrança de assinatura BlackBelt → Academia
- Onboarding de conta Efí para academia (automático)
- Criação de planos de mensalidade pela academia
- Assinatura de plano pelo aluno (PIX Automático)
- Split de pagamento (opcional: taxa BlackBelt)
- Webhooks para confirmar pagamentos
- Dashboard de pagamentos para dono da academia

### Não Inclui (fora do escopo - v1)
- Pagamento via cartão de crédito
- Pagamento via boleto
- Antecipação de recebíveis
- Marketplace de produtos (loja com pagamento integrado)
- Emissão de nota fiscal automática

---

## Arquitetura de Pagamentos

```
┌─────────────────────────────────────────────────────────────────┐
│                        FLUXO PRINCIPAL                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Academia cadastra no BlackBelt                              │
│     ↓                                                           │
│  2. Backend cria conta Efí via API Abertura de Contas           │
│     (CPF/CNPJ + dados bancários do dono)                        │
│     ↓                                                           │
│  3. Academia cria planos (ex: "Mensal R$150", "Trimestral R$400")│
│     ↓                                                           │
│  4. Aluno escolhe plano no app                                  │
│     ↓                                                           │
│  5. Backend cria recorrência PIX Automático                     │
│     ↓                                                           │
│  6. Aluno autoriza no app do banco (uma vez)                    │
│     ↓                                                           │
│  7. Cobrança automática todo mês                                │
│     ↓                                                           │
│  8. Split: 95-100% academia + 0-5% BlackBelt (configurável)     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Requisitos Funcionais

### Onboarding Academia

1. **[PAY-001]** Sistema deve criar conta Efí automaticamente ao cadastrar academia
2. **[PAY-002]** Dono deve informar: CPF/CNPJ, dados bancários, endereço
3. **[PAY-003]** Sistema deve armazenar credenciais da conta Efí de forma segura (encriptadas)
4. **[PAY-004]** Sistema deve notificar dono quando conta estiver ativa

### Planos de Mensalidade

5. **[PAY-005]** Dono deve poder criar planos com: nome, valor, periodicidade
6. **[PAY-006]** Periodicidades suportadas: MENSAL, TRIMESTRAL, SEMESTRAL, ANUAL
7. **[PAY-007]** Dono deve poder ativar/desativar planos
8. **[PAY-008]** Dono deve poder editar planos (não afeta assinaturas existentes)

### Assinatura do Aluno

9. **[PAY-009]** Aluno deve ver planos disponíveis da academia
10. **[PAY-010]** Aluno deve poder assinar plano via PIX Automático
11. **[PAY-011]** Sistema deve gerar QR Code / link para autorização
12. **[PAY-012]** Sistema deve atualizar status após autorização do aluno
13. **[PAY-013]** Aluno deve poder cancelar assinatura (com regras de aviso prévio)

### Cobranças e Pagamentos

14. **[PAY-014]** Sistema deve criar cobranças automaticamente conforme periodicidade
15. **[PAY-015]** Sistema deve processar webhooks de pagamento confirmado
16. **[PAY-016]** Sistema deve atualizar status da assinatura (ativa/inadimplente/cancelada)
17. **[PAY-017]** Sistema deve aplicar split configurado (BlackBelt + Academia)

### Dashboard

18. **[PAY-018]** Dono deve ver lista de assinaturas ativas
19. **[PAY-019]** Dono deve ver histórico de pagamentos recebidos
20. **[PAY-020]** Dono deve ver alunos inadimplentes
21. **[PAY-021]** Dono deve ver previsão de recebimentos

---

## Requisitos Técnicos

### Integração Efí Bank

- **API Abertura de Contas** — criar subcontas (⚠️ requer aprovação comercial)
- **API PIX** — cobranças e split
- **API PIX Automático** — recorrência
- **Webhooks** — confirmação de pagamentos
- **mTLS** — certificado .p12/.pem obrigatório

### Backend Go

```
backend/
├── internal/
│   ├── adapters/
│   │   └── efi/
│   │       ├── client.go        # HTTP client com mTLS
│   │       ├── auth.go          # OAuth2 token management
│   │       ├── accounts.go      # API Abertura de Contas
│   │       ├── pix.go           # API PIX (cobranças)
│   │       ├── split.go         # Configuração de split
│   │       ├── recurring.go     # PIX Automático
│   │       └── webhooks.go      # Handler de webhooks
│   ├── ports/
│   │   └── payments.go          # Interface PaymentProvider
│   ├── domain/
│   │   ├── subscription.go      # Entidade Assinatura
│   │   ├── plan.go              # Entidade Plano
│   │   └── payment.go           # Entidade Pagamento
│   └── handlers/
│       ├── plans.go             # CRUD de planos
│       ├── subscriptions.go     # Assinaturas
│       └── webhooks.go          # Receber webhooks Efí
```

### Database (Supabase)

```sql
-- Conta Efí da academia
CREATE TABLE academy_efi_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID REFERENCES academies(id) ON DELETE CASCADE,
  efi_account_id TEXT NOT NULL,
  efi_credentials JSONB NOT NULL, -- encriptado
  status TEXT DEFAULT 'pending', -- pending, active, suspended
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Planos da academia
CREATE TABLE academy_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID REFERENCES academies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL,
  periodicity TEXT NOT NULL, -- MENSAL, TRIMESTRAL, SEMESTRAL, ANUAL
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Assinaturas dos alunos
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID REFERENCES academies(id),
  user_id UUID REFERENCES profiles(id),
  plan_id UUID REFERENCES academy_plans(id),
  efi_rec_id TEXT, -- ID da recorrência na Efí
  status TEXT DEFAULT 'pending', -- pending, active, cancelled, suspended
  started_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  next_billing_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Histórico de pagamentos
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id),
  academy_id UUID REFERENCES academies(id),
  user_id UUID REFERENCES profiles(id),
  efi_txid TEXT,
  amount_cents INTEGER NOT NULL,
  split_academy_cents INTEGER,
  split_platform_cents INTEGER,
  status TEXT DEFAULT 'pending', -- pending, confirmed, failed, refunded
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Variáveis de Ambiente

```env
# Efí Bank
EFI_CLIENT_ID=your-client-id
EFI_CLIENT_SECRET=your-client-secret
EFI_CERTIFICATE_PATH=/path/to/certificate.pem
EFI_SANDBOX=true
EFI_PIX_URL=https://pix.api.efipay.com.br
EFI_ACCOUNTS_URL=https://abrircontas.api.efipay.com.br
EFI_WEBHOOK_SECRET=webhook-validation-secret

# Split config
PLATFORM_SPLIT_PERCENT=5  # % que BlackBelt fica
```

---

## User Stories

### US-PAY-001: Onboarding Financeiro da Academia
**Como** dono de academia,  
**Quero** configurar minha conta de recebimento ao cadastrar a academia,  
**Para** poder receber pagamentos dos alunos diretamente.

**Critérios de Aceite:**
- [ ] Formulário coleta CPF/CNPJ, dados bancários, endereço
- [ ] Sistema cria conta Efí automaticamente
- [ ] Dono recebe notificação quando conta está ativa
- [ ] Credenciais são armazenadas de forma segura

### US-PAY-002: Criar Plano de Mensalidade
**Como** dono de academia,  
**Quero** criar planos de mensalidade com diferentes valores e periodicidades,  
**Para** oferecer opções flexíveis aos meus alunos.

**Critérios de Aceite:**
- [ ] Posso criar plano com nome, valor e periodicidade
- [ ] Posso ativar/desativar planos
- [ ] Alunos só veem planos ativos

### US-PAY-003: Assinar Plano
**Como** aluno,  
**Quero** assinar um plano da academia via PIX,  
**Para** pagar minha mensalidade de forma automática.

**Critérios de Aceite:**
- [ ] Vejo planos disponíveis da minha academia
- [ ] Ao escolher, recebo QR Code / link para autorizar
- [ ] Após autorizar no banco, assinatura fica ativa
- [ ] Recebo confirmação no app

### US-PAY-004: Ver Pagamentos Recebidos
**Como** dono de academia,  
**Quero** ver todos os pagamentos recebidos,  
**Para** acompanhar minha receita.

**Critérios de Aceite:**
- [ ] Lista mostra: aluno, plano, valor, data, status
- [ ] Posso filtrar por período
- [ ] Vejo total recebido no período

### US-PAY-005: Ver Inadimplentes
**Como** dono de academia,  
**Quero** ver alunos com pagamento atrasado,  
**Para** tomar ações de cobrança.

**Critérios de Aceite:**
- [ ] Lista mostra alunos com status "inadimplente"
- [ ] Vejo há quantos dias está atrasado
- [ ] Posso enviar lembrete (WhatsApp)

---

## Tasks de Implementação

### Fase 1: Setup e Infraestrutura

#### Backend
- [ ] Criar estrutura `/backend` com Go modules
- [ ] Implementar client HTTP com mTLS para Efí
- [ ] Implementar OAuth2 token management (refresh automático)
- [ ] Criar handler de webhooks genérico
- [ ] Configurar variáveis de ambiente

#### Database
- [ ] Migration: `academy_efi_accounts`
- [ ] Migration: `academy_plans`
- [ ] Migration: `subscriptions`
- [ ] Migration: `payments`
- [ ] RLS policies para cada tabela

### Fase 2: Onboarding de Academia

#### Backend
- [ ] Endpoint `POST /api/academies/:id/payment-setup`
- [ ] Integração com API Abertura de Contas Efí
- [ ] Armazenamento seguro de credenciais
- [ ] Webhook para confirmação de conta ativa

#### Mobile
- [ ] Tela de setup financeiro no onboarding da academia
- [ ] Formulário de dados bancários
- [ ] Estado de "aguardando ativação"
- [ ] Notificação quando conta ativa

### Fase 3: Planos de Mensalidade

#### Backend
- [ ] CRUD completo de planos (`/api/academies/:id/plans`)
- [ ] Validações de negócio

#### Mobile
- [ ] Tela de gerenciamento de planos (dono)
- [ ] Criar/editar/desativar planos
- [ ] Lista de planos para aluno

### Fase 4: Assinaturas

#### Backend
- [ ] Endpoint `POST /api/subscriptions` (criar assinatura)
- [ ] Integração com PIX Automático Efí
- [ ] Endpoint `DELETE /api/subscriptions/:id` (cancelar)
- [ ] Webhook de autorização confirmada

#### Mobile
- [ ] Fluxo de assinatura de plano
- [ ] Exibição de QR Code / deep link
- [ ] Status da assinatura no perfil
- [ ] Cancelamento de assinatura

### Fase 5: Processamento de Pagamentos

#### Backend
- [ ] Handler de webhook de pagamento confirmado
- [ ] Lógica de split (calcular valores)
- [ ] Atualização de status da assinatura
- [ ] Registro em `payments`

### Fase 6: Dashboard

#### Mobile
- [ ] Tela de pagamentos recebidos (dono)
- [ ] Lista de assinaturas ativas
- [ ] Lista de inadimplentes
- [ ] Resumo financeiro (cards)

---

## Riscos e Mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| API Abertura de Contas não aprovada | Alto | Média | Fallback: onboarding manual, academia cria conta Efí por fora |
| PIX Automático não disponível no banco do aluno | Médio | Baixa | Fallback: gerar cobrança PIX normal (aluno paga manualmente) |
| Falha em webhook (perda de confirmação) | Alto | Baixa | Retry automático + reconciliação periódica |
| Chargeback/estorno não suportado com split | Médio | Baixa | Documentar limitação, não permitir estorno via app |

---

## Métricas de Sucesso

- **Taxa de conversão:** % de academias que completam setup financeiro
- **Taxa de assinatura:** % de alunos que assinam plano
- **Taxa de inadimplência:** % de assinaturas com pagamento atrasado
- **MRR (Monthly Recurring Revenue):** receita recorrente mensal do BlackBelt
- **Churn:** % de cancelamentos por mês

---

## Referências

- [Documentação Efí Bank](/docs/payments/EFI-BANK.md)
- [Comparação de Provedores](/docs/payments/PROVIDERS-COMPARISON.md)
- [Efí API Docs](https://dev.efipay.com.br)
- [PIX Automático](https://dev.efipay.com.br/en/docs/api-pix/pix-automatico/)
- [Split de Pagamento](https://dev.efipay.com.br/en/docs/api-pix/split-de-pagamento-pix/)

---

## Checklist Pré-Implementação

- [ ] Criar conta Efí Empresas para BlackBelt
- [ ] Contatar comercial Efí para liberar API Abertura de Contas
- [ ] Gerar certificado .p12/.pem de produção
- [ ] Testar fluxo completo em sandbox
- [ ] Definir % de split (taxa da plataforma)
- [ ] Revisar compliance/termos de uso

---

*Criado em: 2026-02-08*  
*Última atualização: 2026-02-08*
