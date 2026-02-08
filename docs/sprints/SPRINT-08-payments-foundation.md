# Sprint 8: Pagamentos — Fundação

> Setup da infraestrutura de pagamentos com Efí Bank

## Objetivo

Estabelecer a base técnica para o sistema de pagamentos: backend Go, integração com Efí Bank, e tabelas no Supabase.

**Duração estimada:** 2-3 semanas

**Épico:** [EPIC-PAYMENTS](/docs/epics/EPIC-PAYMENTS.md)

**Dependências:**
- Sprint 7 (Painel Owner) — parcialmente, pode rodar em paralelo
- Aprovação comercial Efí (API Abertura de Contas)

---

## Entregáveis

### 1. Backend Go — Estrutura Base
- [ ] Inicializar projeto Go (`/backend`)
- [ ] Configurar Go modules
- [ ] Estrutura de pastas (clean architecture)
- [ ] Configuração de ambiente (env vars)
- [ ] Dockerfile para desenvolvimento

### 2. Integração Efí — Client Base
- [ ] HTTP client com mTLS (certificado .p12/.pem)
- [ ] OAuth2 token management
- [ ] Refresh automático de token
- [ ] Logging de requisições
- [ ] Tratamento de erros Efí

### 3. Database — Migrations
- [ ] Tabela `academy_efi_accounts`
- [ ] Tabela `academy_plans`
- [ ] Tabela `subscriptions`
- [ ] Tabela `payments`
- [ ] RLS policies básicas

### 4. Webhook Handler
- [ ] Endpoint `/webhooks/efi`
- [ ] Validação de assinatura
- [ ] Roteamento por tipo de evento
- [ ] Logging e retry logic

---

## Tasks Detalhadas

### Backend Setup

```bash
# Estrutura esperada
backend/
├── cmd/
│   └── api/
│       └── main.go
├── internal/
│   ├── config/
│   │   └── config.go
│   ├── adapters/
│   │   └── efi/
│   │       ├── client.go
│   │       ├── auth.go
│   │       └── types.go
│   ├── ports/
│   │   └── payments.go
│   ├── domain/
│   │   ├── plan.go
│   │   ├── subscription.go
│   │   └── payment.go
│   └── handlers/
│       └── webhooks.go
├── go.mod
├── go.sum
├── Dockerfile
└── .env.example
```

**Task 8.1:** Inicializar projeto Go
```bash
cd backend
go mod init github.com/blackbelt/backend
```

**Task 8.2:** Estrutura de config
- Carregar variáveis de ambiente
- Validar config obrigatória
- Suportar .env em dev

**Task 8.3:** Client Efí com mTLS
```go
// internal/adapters/efi/client.go
type Client struct {
    httpClient *http.Client
    baseURL    string
    token      *Token
    mu         sync.RWMutex
}

func NewClient(certPath, clientID, clientSecret string) (*Client, error) {
    // Carregar certificado P12/PEM
    // Configurar TLS
    // Retornar client
}
```

**Task 8.4:** OAuth2 Token Management
```go
// internal/adapters/efi/auth.go
func (c *Client) Authenticate() error {
    // POST /oauth/token
    // Armazenar token
    // Agendar refresh antes de expirar
}
```

### Database Migrations

**Task 8.5:** Migration `academy_efi_accounts`
```sql
-- /supabase/migrations/20260208_create_academy_efi_accounts.sql
CREATE TABLE academy_efi_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  efi_account_id TEXT,
  efi_credentials_encrypted TEXT, -- AES-256 encrypted JSON
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'suspended', 'error')),
  status_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(academy_id)
);

-- RLS
ALTER TABLE academy_efi_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view own academy efi account"
  ON academy_efi_accounts FOR SELECT
  USING (
    academy_id IN (
      SELECT id FROM academies WHERE owner_id = auth.uid()
    )
  );
```

**Task 8.6:** Migration `academy_plans`
```sql
-- /supabase/migrations/20260208_create_academy_plans.sql
CREATE TABLE academy_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL CHECK (price_cents > 0),
  periodicity TEXT NOT NULL
    CHECK (periodicity IN ('MENSAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_academy_plans_academy ON academy_plans(academy_id);
CREATE INDEX idx_academy_plans_active ON academy_plans(academy_id, is_active);

-- RLS
ALTER TABLE academy_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view active plans"
  ON academy_plans FOR SELECT
  USING (
    is_active = true
    AND academy_id IN (
      SELECT academy_id FROM academy_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owner can manage plans"
  ON academy_plans FOR ALL
  USING (
    academy_id IN (
      SELECT id FROM academies WHERE owner_id = auth.uid()
    )
  );
```

**Task 8.7:** Migration `subscriptions`
```sql
-- /supabase/migrations/20260208_create_subscriptions.sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES academies(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  plan_id UUID NOT NULL REFERENCES academy_plans(id),
  efi_rec_id TEXT, -- ID da recorrência na Efí
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'awaiting_authorization', 'active', 'cancelled', 'suspended', 'expired')),
  started_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  next_billing_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, plan_id, status) -- evita duplicatas ativas
);

-- Índices
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_academy ON subscriptions(academy_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "User can create subscription"
  ON subscriptions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Owner can view academy subscriptions"
  ON subscriptions FOR SELECT
  USING (
    academy_id IN (
      SELECT id FROM academies WHERE owner_id = auth.uid()
    )
  );
```

**Task 8.8:** Migration `payments`
```sql
-- /supabase/migrations/20260208_create_payments.sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id),
  academy_id UUID NOT NULL REFERENCES academies(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  efi_txid TEXT,
  efi_e2e_id TEXT, -- endToEndId do PIX
  amount_cents INTEGER NOT NULL,
  split_academy_cents INTEGER,
  split_platform_cents INTEGER,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'confirmed', 'failed', 'refunded')),
  paid_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_payments_subscription ON payments(subscription_id);
CREATE INDEX idx_payments_academy ON payments(academy_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_efi_txid ON payments(efi_txid);

-- RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User can view own payments"
  ON payments FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Owner can view academy payments"
  ON payments FOR SELECT
  USING (
    academy_id IN (
      SELECT id FROM academies WHERE owner_id = auth.uid()
    )
  );
```

### Webhook Handler

**Task 8.9:** Webhook endpoint
```go
// internal/handlers/webhooks.go
func (h *WebhookHandler) HandleEfi(w http.ResponseWriter, r *http.Request) {
    // 1. Validar assinatura/origem
    // 2. Parsear payload
    // 3. Rotear por tipo de evento
    // 4. Processar
    // 5. Retornar 200 OK
}
```

---

## Critérios de Aceite

- [ ] Backend Go compila e roda localmente
- [ ] Client Efí autentica com sucesso em sandbox
- [ ] Migrations aplicadas no Supabase
- [ ] RLS policies funcionando (testadas)
- [ ] Webhook endpoint recebe e loga eventos de teste

---

## Definition of Done

1. Código commitado e revisado
2. Testes básicos passando
3. Documentação atualizada
4. Migrations aplicadas em dev/staging
5. Variáveis de ambiente documentadas

---

## Notas

### Certificado Efí

Para desenvolvimento local:
1. Acessar painel Efí → API → Certificados
2. Gerar certificado de homologação
3. Baixar .p12 e converter para .pem se necessário:
```bash
openssl pkcs12 -in certificado.p12 -out certificado.pem -nodes
```

### Sandbox Efí

- URL PIX: `https://pix-h.api.efipay.com.br`
- URL Abertura Contas: `https://abrircontas-h.api.efipay.com.br`

---

*Sprint criada em: 2026-02-08*
