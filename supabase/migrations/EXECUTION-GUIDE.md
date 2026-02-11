# 🚀 Guia de Execução: Migrations de Monetização

> **Data:** 2026-02-11  
> **Sprint:** 01 - Monetização

---

## ⚡ Quick Start

### Via Supabase Studio (Recomendado)

1. Acesse: https://supabase.com/dashboard/project/djfjyvzgucmrmiavbbnn/editor

2. SQL Editor → New query

3. **Primeira migration:** Cole e execute
   ```
   20260211_000_helper_functions.sql
   ```

4. **Segunda migration:** Cole e execute
   ```
   20260211_001_academy_subscriptions_final.sql
   ```

5. ✅ Pronto!

---

## 📋 Checklist Pré-Execução

- [ ] Backup do banco (opcional mas recomendado)
- [ ] Testado em dev/staging primeiro?
- [ ] Service role key funcionando?
- [ ] Migrations em ordem correta?

---

## 🔍 Verificação Pós-Execução

Execute estas queries para confirmar:

### 1. Tabelas criadas

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'subscription_plans',
    'subscriptions',
    'payment_history',
    'webhook_events'
  )
ORDER BY table_name;
```

**Esperado:** 4 tabelas

### 2. Enums criados

```sql
SELECT typname 
FROM pg_type 
WHERE typcategory = 'E' 
  AND typname LIKE '%status' 
   OR typname = 'payment_gateway'
ORDER BY typname;
```

**Esperado:**
- payment_status
- subscription_status
- webhook_status
- payment_gateway

### 3. Planos seed

```sql
SELECT slug, name, price_monthly/100.0 as price_reais, max_students
FROM subscription_plans
WHERE is_active = true
ORDER BY price_monthly;
```

**Esperado:**
- starter: R$ 99,00 (50 alunos)
- pro: R$ 199,00 (200 alunos)
- business: R$ 399,00 (ilimitado)

### 4. Trigger funcionando

Criar academia de teste e verificar se subscription em trial é criada automaticamente:

```sql
-- Criar academia teste
INSERT INTO academies (owner_id, name, city, invite_code)
VALUES (
  auth.uid(),
  'Academia Teste',
  'São Paulo',
  'TEST01'
) RETURNING id;

-- Verificar subscription criada
SELECT 
  s.status,
  s.trial_end_date,
  sp.name as plan_name
FROM subscriptions s
JOIN subscription_plans sp ON sp.id = s.plan_id
WHERE s.academy_id = (SELECT id FROM academies WHERE invite_code = 'TEST01');
```

**Esperado:**
- status: trialing
- trial_end_date: ~20 dias no futuro
- plan_name: Starter

### 5. RLS funcionando

```sql
-- Tentar acessar subscriptions de outra academia (deve falhar)
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims.sub TO '00000000-0000-0000-0000-000000000000';

SELECT * FROM subscriptions WHERE academy_id != (
  SELECT id FROM academies WHERE owner_id = '00000000-0000-0000-0000-000000000000'
);
```

**Esperado:** 0 rows (RLS bloqueando)

---

## 🔧 CLI Helper (Opcional)

Se preferir via CLI do Supabase:

```bash
# Verificar tabelas
/home/magnani/.openclaw/mcp-servers/supabase/supa list-tables

# Ver planos
/home/magnani/.openclaw/mcp-servers/supabase/supa query subscription_plans

# Ver subscriptions
/home/magnani/.openclaw/mcp-servers/supabase/supa query subscriptions

# Contar webhooks
/home/magnani/.openclaw/mcp-servers/supabase/supa count webhook_events
```

---

## ⚠️ Rollback (Se Necessário)

```sql
-- CUIDADO: Remove tudo
DROP TABLE IF EXISTS public.webhook_events CASCADE;
DROP TABLE IF EXISTS public.payment_history CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.subscription_plans CASCADE;

DROP FUNCTION IF EXISTS create_trial_subscription() CASCADE;

DROP TYPE IF EXISTS webhook_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS payment_gateway CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;
```

---

## 🚨 Troubleshooting

### Erro: "function update_updated_at() does not exist"

**Solução:** Executar `20260211_000_helper_functions.sql` primeiro

### Erro: "type subscription_status already exists"

**Solução:** Normal se executar duas vezes. Migration tem `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object THEN null; END $$;`

### Erro: "relation academies does not exist"

**Solução:** Tabela `academies` deve existir antes. Verificar schema base.

### Subscription não criada automaticamente

**Solução:** Verificar se trigger foi criado:
```sql
SELECT tgname FROM pg_trigger WHERE tgname = 'create_trial_on_academy_creation';
```

---

## 📊 Monitoramento

Após executar, monitorar:

```sql
-- Academias com trial expirando em 3 dias
SELECT 
  a.name,
  s.trial_end_date,
  s.trial_end_date - NOW() as days_remaining
FROM subscriptions s
JOIN academies a ON a.id = s.academy_id
WHERE s.status = 'trialing'
  AND s.trial_end_date BETWEEN NOW() AND NOW() + INTERVAL '3 days';

-- MRR (Monthly Recurring Revenue)
SELECT 
  SUM(sp.price_monthly) / 100.0 AS mrr_brl
FROM subscriptions s
JOIN subscription_plans sp ON sp.id = s.plan_id
WHERE s.status = 'active';
```

---

## ✅ Success Criteria

Migration bem-sucedida quando:

- [x] 4 tabelas criadas
- [x] 4 enums criados
- [x] 3 planos seed inseridos
- [x] Trigger criando trial automaticamente
- [x] RLS bloqueando acessos não autorizados
- [x] Sem erros no log

---

**Próximos passos após migration:**
1. Atualizar tipos TypeScript no mobile
2. Implementar endpoints Go no backend
3. Integrar Stripe/Efí Bank
4. Criar tela de billing no owner dashboard

---

**Contato para dúvidas:**  
Revisar `/mnt/c/Users/carlo/Documents/BlackBelt-Docs/Black Belt/Audits/` para audits completos
