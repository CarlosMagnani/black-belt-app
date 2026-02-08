# Sprint 9: Pagamentos — Planos e Assinaturas

> Implementação de planos, assinaturas e fluxo de pagamento PIX Automático

## Objetivo

Permitir que donos criem planos de mensalidade e alunos assinem via PIX Automático.

**Duração estimada:** 2-3 semanas

**Épico:** [EPIC-PAYMENTS](/docs/epics/EPIC-PAYMENTS.md)

**Dependências:**
- Sprint 8 (Pagamentos — Fundação) ✓

---

## Entregáveis

### 1. Onboarding Financeiro da Academia
- [ ] Endpoint para setup de conta Efí
- [ ] Integração com API Abertura de Contas
- [ ] Tela de configuração no app (dono)
- [ ] Notificação de conta ativa

### 2. CRUD de Planos
- [ ] Endpoints REST para planos
- [ ] Tela de gerenciamento de planos (dono)
- [ ] Lista de planos para aluno

### 3. Fluxo de Assinatura
- [ ] Criar recorrência PIX Automático
- [ ] Gerar QR Code / link de autorização
- [ ] Processar webhook de autorização
- [ ] Atualizar status da assinatura

### 4. Processamento de Pagamentos
- [ ] Webhook de pagamento confirmado
- [ ] Lógica de split
- [ ] Atualização de status

---

## Tasks Detalhadas

### Onboarding Financeiro

**Task 9.1:** Endpoint de setup financeiro
```go
// POST /api/academies/:id/payment-setup
type PaymentSetupRequest struct {
    OwnerCPF      string `json:"owner_cpf"`
    OwnerCNPJ     string `json:"owner_cnpj,omitempty"` // opcional se PF
    BankCode      string `json:"bank_code"`
    BankAgency    string `json:"bank_agency"`
    BankAccount   string `json:"bank_account"`
    BankAccountType string `json:"bank_account_type"` // corrente, poupanca
    Address       Address `json:"address"`
}
```

**Task 9.2:** Integração API Abertura de Contas
```go
// internal/adapters/efi/accounts.go
func (c *Client) CreateAccount(req CreateAccountRequest) (*Account, error) {
    // POST para API Abertura de Contas
    // Retorna ID da conta criada
}
```

**Task 9.3:** Tela de setup (Mobile)
- Formulário multi-step
- Validação de CPF/CNPJ
- Seleção de banco
- Confirmação

### CRUD de Planos

**Task 9.4:** Endpoints de planos
```go
// GET    /api/academies/:id/plans      - listar
// POST   /api/academies/:id/plans      - criar
// PUT    /api/plans/:id                - atualizar
// DELETE /api/plans/:id                - desativar (soft delete)

type CreatePlanRequest struct {
    Name        string `json:"name"`
    Description string `json:"description,omitempty"`
    PriceCents  int    `json:"price_cents"`
    Periodicity string `json:"periodicity"` // MENSAL, TRIMESTRAL, etc
}
```

**Task 9.5:** Tela de planos (Mobile - Dono)
- Lista de planos existentes
- Botão criar novo
- Modal de criação/edição
- Toggle ativo/inativo

**Task 9.6:** Lista de planos (Mobile - Aluno)
- Card para cada plano
- Nome, descrição, preço
- Botão "Assinar"

### Fluxo de Assinatura

**Task 9.7:** Criar assinatura
```go
// POST /api/subscriptions
type CreateSubscriptionRequest struct {
    PlanID string `json:"plan_id"`
}

// Response
type CreateSubscriptionResponse struct {
    SubscriptionID string `json:"subscription_id"`
    QRCode         string `json:"qr_code"`      // base64
    PixCopiaECola  string `json:"pix_copia_cola"`
    ExpiresAt      string `json:"expires_at"`
}
```

**Task 9.8:** Integração PIX Automático
```go
// internal/adapters/efi/recurring.go
func (c *Client) CreateRecurrence(req CreateRecurrenceRequest) (*Recurrence, error) {
    // POST /v2/rec
    // Retorna idRec e dados do QR
}
```

**Task 9.9:** Tela de assinatura (Mobile)
- Resumo do plano
- QR Code grande
- Botão "Copiar código PIX"
- Status em tempo real
- Deep link para app do banco

**Task 9.10:** Webhook de autorização
```go
// Quando aluno autoriza no banco
func (h *WebhookHandler) HandleRecurrenceAuthorized(payload RecurrenceWebhook) error {
    // 1. Buscar subscription pelo efi_rec_id
    // 2. Atualizar status para 'active'
    // 3. Definir next_billing_at
    // 4. Notificar aluno e academia
}
```

### Processamento de Pagamentos

**Task 9.11:** Webhook de pagamento
```go
func (h *WebhookHandler) HandlePaymentConfirmed(payload PaymentWebhook) error {
    // 1. Buscar subscription
    // 2. Calcular split
    // 3. Criar registro em payments
    // 4. Atualizar next_billing_at
    // 5. Notificar
}
```

**Task 9.12:** Lógica de split
```go
func CalculateSplit(amountCents int, platformPercent float64) (academyCents, platformCents int) {
    platformCents = int(float64(amountCents) * platformPercent / 100)
    academyCents = amountCents - platformCents
    return
}
```

---

## Fluxo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO DE ASSINATURA                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [App] Aluno clica "Assinar" no plano                           │
│     │                                                           │
│     ▼                                                           │
│  [Backend] POST /api/subscriptions                              │
│     │                                                           │
│     ▼                                                           │
│  [Backend → Efí] POST /v2/rec (criar recorrência)               │
│     │                                                           │
│     ▼                                                           │
│  [Efí] Retorna idRec + QR Code                                  │
│     │                                                           │
│     ▼                                                           │
│  [Backend] Salva subscription (status: awaiting_authorization)  │
│     │                                                           │
│     ▼                                                           │
│  [App] Exibe QR Code para aluno                                 │
│     │                                                           │
│     ▼                                                           │
│  [Aluno] Abre app do banco, escaneia QR, autoriza               │
│     │                                                           │
│     ▼                                                           │
│  [Efí → Backend] Webhook: recorrência autorizada                │
│     │                                                           │
│     ▼                                                           │
│  [Backend] Atualiza subscription (status: active)               │
│     │                                                           │
│     ▼                                                           │
│  [App] Notifica aluno: "Assinatura ativa!"                      │
│                                                                 │
│  --- A cada ciclo (mensal, etc) ---                             │
│                                                                 │
│  [Efí] Cobra automaticamente                                    │
│     │                                                           │
│     ▼                                                           │
│  [Efí → Backend] Webhook: pagamento confirmado                  │
│     │                                                           │
│     ▼                                                           │
│  [Backend] Registra payment + aplica split                      │
│     │                                                           │
│     ▼                                                           │
│  [Academia] Recebe 95% na conta Efí                             │
│  [BlackBelt] Recebe 5% na conta Efí                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Critérios de Aceite

### Onboarding
- [ ] Dono consegue configurar dados bancários
- [ ] Conta Efí é criada automaticamente
- [ ] Dono é notificado quando conta ativa

### Planos
- [ ] Dono consegue criar plano com nome, valor, periodicidade
- [ ] Dono consegue ativar/desativar planos
- [ ] Aluno vê apenas planos ativos da sua academia

### Assinatura
- [ ] Aluno consegue iniciar assinatura
- [ ] QR Code é exibido corretamente
- [ ] Após autorização, status atualiza para ativo
- [ ] Aluno vê assinatura no perfil

### Pagamentos
- [ ] Webhook processa pagamento confirmado
- [ ] Split é calculado corretamente
- [ ] Registro é criado na tabela payments

---

## Definition of Done

1. Fluxo completo testado em sandbox
2. Testes unitários para lógica de split
3. Testes de integração para webhooks
4. UI/UX revisada
5. Documentação de API atualizada

---

*Sprint criada em: 2026-02-08*
