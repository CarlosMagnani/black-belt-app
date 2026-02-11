# 📦 Migrations do BlackBelt

## Como Executar

### Opção 1: Supabase Studio (Web) ⭐ Recomendado

1. Acesse: https://supabase.com/dashboard/project/djfjyvzgucmrmiavbbnn/editor
2. Vá em **SQL Editor** (ícone de banco de dados na sidebar)
3. Clique em **+ New query**
4. **Primeiro:** Cole o conteúdo de `20260211_000_helper_functions.sql`
5. Clique em **Run** (ou Ctrl+Enter)
6. **Depois:** Cole o conteúdo de `20260211_001_academy_subscriptions_final.sql`
7. Clique em **Run** novamente

### Opção 2: Supabase CLI

```bash
# Se tiver supabase CLI instalado
cd /home/magnani/projects/black-belt-app
supabase db push
```

### Opção 3: psql (PostgreSQL CLI)

```bash
# Se tiver acesso direto ao banco
psql "postgresql://postgres:[PASSWORD]@db.djfjyvzgucmrmiavbbnn.supabase.co:5432/postgres"

# Depois:
\i supabase/migrations/20260211_000_helper_functions.sql
\i supabase/migrations/20260211_001_academy_subscriptions_final.sql
```

---

## Migrations Disponíveis

### 20260211_000_helper_functions.sql ✅
**Criada:** 2026-02-11  
**Descrição:** Função helper `update_updated_at()` para triggers  
**Dependências:** Nenhuma  
**Status:** Pronta para executar

### 20260211_001_academy_subscriptions_final.sql ✅
**Criada:** 2026-02-11  
**Descrição:** Sistema de monetização B2B completo (plans + subscriptions + payment_history + webhook_events)  
**Dependências:** `update_updated_at()` (da migration anterior)  
**Status:** Pronta para executar

**O que cria:**
- `subscription_plans` — Planos do BlackBelt (3 planos seed)
- `subscriptions` — Assinaturas das academias
- `payment_history` — Histórico de pagamentos
- `webhook_events` — Auditoria de webhooks
- RLS policies completas
- Trigger automático para criar trial ao criar academia
- Índices otimizados

**Features:**
- ✅ Trial de 20 dias automático
- ✅ Status (trialing, active, past_due, canceled)
- ✅ Integração Stripe (subscription_id, customer_id)
- ✅ Integração PIX Automático (authorization + recurrence)
- ✅ Payment history com múltiplos métodos
- ✅ Webhook audit (pix + stripe)
- ✅ RLS: owner vê apenas própria subscription
- ✅ 3 planos pré-configurados (Starter, Pro, Business)

---

## Após Executar

Verifique que tudo funcionou:

```bash
# Listar tabelas
/home/magnani/.openclaw/mcp-servers/supabase/supa list-tables

# Ver planos criados
/home/magnani/.openclaw/mcp-servers/supabase/supa query subscription_plans

# Ver subscriptions (deve estar vazia ou com trial da academia existente)
/home/magnani/.openclaw/mcp-servers/supabase/supa query subscriptions
```

---

## Rollback (se necessário)

```sql
-- Remover tudo (cuidado!)
DROP TABLE IF EXISTS public.payment_history CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.subscription_plans CASCADE;
DROP TABLE IF EXISTS public.webhook_events CASCADE;
DROP FUNCTION IF EXISTS create_trial_subscription() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
```

---

**Próximos passos após migrations:**
1. Atualizar TypeScript types em `blackbelt-ports.ts`
2. Criar hooks React (`useSubscription`, `usePaymentHistory`)
3. Implementar tela de billing no owner dashboard
4. Integrar backend Go com essas tabelas

---

## Arquivo Arquivado

- `_archive/20260211_create_subscriptions_DEPRECATED.sql` (rascunho inicial, não usar)
