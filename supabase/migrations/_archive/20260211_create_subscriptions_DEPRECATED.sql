-- Migration: Subscriptions & Plans (B2B - BlackBelt cobrando Academias)
-- Data: 2026-02-11
-- Sprint: 01 - Monetização

-- ============================================================
-- SUBSCRIPTION PLANS (Planos que BlackBelt oferece)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  interval TEXT NOT NULL CHECK (interval IN ('month', 'year')),
  interval_count INTEGER NOT NULL DEFAULT 1 CHECK (interval_count > 0),
  trial_days INTEGER NOT NULL DEFAULT 20,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  stripe_price_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active 
  ON public.subscription_plans(is_active) 
  WHERE is_active = TRUE;

-- Trigger updated_at
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SUBSCRIPTIONS (Assinaturas das Academias)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
  
  -- Status da assinatura
  status TEXT NOT NULL DEFAULT 'trialing' 
    CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'unpaid')),
  
  -- Trial
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  
  -- Período atual
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL,
  
  -- Cancelamento
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancel_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  
  -- Integrações externas
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  pix_charge_id TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT trial_dates_valid 
    CHECK (trial_end IS NULL OR trial_end > trial_start),
  CONSTRAINT period_dates_valid 
    CHECK (current_period_end > current_period_start),
  CONSTRAINT one_subscription_per_academy 
    UNIQUE (academy_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_subscriptions_academy 
  ON public.subscriptions(academy_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_status 
  ON public.subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_end 
  ON public.subscriptions(trial_end) 
  WHERE status = 'trialing';

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe 
  ON public.subscriptions(stripe_subscription_id) 
  WHERE stripe_subscription_id IS NOT NULL;

-- Trigger updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- PAYMENT HISTORY (Histórico de pagamentos)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  academy_id UUID NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'BRL',
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  
  -- Método de pagamento
  payment_method TEXT CHECK (payment_method IN ('pix', 'stripe', 'manual')),
  
  -- Integrações
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,
  pix_transaction_id TEXT,
  
  -- Datas
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_payment_history_subscription 
  ON public.payment_history(subscription_id);

CREATE INDEX IF NOT EXISTS idx_payment_history_academy 
  ON public.payment_history(academy_id);

CREATE INDEX IF NOT EXISTS idx_payment_history_status 
  ON public.payment_history(status);

CREATE INDEX IF NOT EXISTS idx_payment_history_created 
  ON public.payment_history(created_at DESC);

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- Subscription Plans: todos podem ver planos ativos
CREATE POLICY "Public can view active plans"
  ON public.subscription_plans FOR SELECT
  USING (is_active = TRUE);

-- Subscriptions: owner vê própria subscription
CREATE POLICY "Owners view own subscription"
  ON public.subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.academies
      WHERE academies.id = subscriptions.academy_id
        AND academies.owner_id = auth.uid()
    )
  );

-- Subscriptions: owner pode atualizar própria subscription (cancelar, etc)
CREATE POLICY "Owners update own subscription"
  ON public.subscriptions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.academies
      WHERE academies.id = subscriptions.academy_id
        AND academies.owner_id = auth.uid()
    )
  );

-- Payment History: owner vê próprio histórico
CREATE POLICY "Owners view own payment history"
  ON public.payment_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.academies
      WHERE academies.id = payment_history.academy_id
        AND academies.owner_id = auth.uid()
    )
  );

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Função para iniciar trial automaticamente ao criar academia
CREATE OR REPLACE FUNCTION create_trial_subscription()
RETURNS TRIGGER AS $$
DECLARE
  default_plan_id UUID;
BEGIN
  -- Pega o plano padrão (primeiro plano ativo)
  SELECT id INTO default_plan_id
  FROM public.subscription_plans
  WHERE is_active = TRUE
  ORDER BY price_cents
  LIMIT 1;
  
  -- Cria subscription em trial
  INSERT INTO public.subscriptions (
    academy_id,
    plan_id,
    status,
    trial_start,
    trial_end,
    current_period_start,
    current_period_end
  ) VALUES (
    NEW.id,
    default_plan_id,
    'trialing',
    NOW(),
    NOW() + INTERVAL '20 days',
    NOW(),
    NOW() + INTERVAL '1 month'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: criar trial automaticamente ao criar academia
DROP TRIGGER IF EXISTS create_trial_on_academy_creation ON public.academies;
CREATE TRIGGER create_trial_on_academy_creation
  AFTER INSERT ON public.academies
  FOR EACH ROW
  EXECUTE FUNCTION create_trial_subscription();

-- ============================================================
-- SEED DATA (Planos Iniciais)
-- ============================================================

-- Plano Básico (Mensal)
INSERT INTO public.subscription_plans (
  name,
  description,
  price_cents,
  interval,
  interval_count,
  trial_days,
  features,
  is_active
) VALUES (
  'Plano Básico',
  'Ideal para academias pequenas com até 50 alunos',
  9900, -- R$ 99,00
  'month',
  1,
  20,
  '["Até 50 alunos", "Check-in ilimitado", "Agenda de aulas", "Suporte por email"]'::jsonb,
  TRUE
) ON CONFLICT DO NOTHING;

-- Plano Profissional (Mensal)
INSERT INTO public.subscription_plans (
  name,
  description,
  price_cents,
  interval,
  interval_count,
  trial_days,
  features,
  is_active
) VALUES (
  'Plano Profissional',
  'Para academias em crescimento com até 150 alunos',
  19900, -- R$ 199,00
  'month',
  1,
  20,
  '["Até 150 alunos", "Check-in ilimitado", "Agenda de aulas", "Loja integrada", "Relatórios avançados", "Suporte prioritário"]'::jsonb,
  TRUE
) ON CONFLICT DO NOTHING;

-- Plano Anual (desconto de 20%)
INSERT INTO public.subscription_plans (
  name,
  description,
  price_cents,
  interval,
  interval_count,
  trial_days,
  features,
  is_active
) VALUES (
  'Plano Anual',
  'Plano Profissional com desconto de 20%',
  190800, -- R$ 1908,00 (12 meses com desconto)
  'year',
  1,
  20,
  '["Até 150 alunos", "Check-in ilimitado", "Agenda de aulas", "Loja integrada", "Relatórios avançados", "Suporte prioritário", "20% de desconto"]'::jsonb,
  TRUE
) ON CONFLICT DO NOTHING;

-- ============================================================
-- COMMENTS (Documentação)
-- ============================================================

COMMENT ON TABLE public.subscription_plans IS 'Planos de assinatura oferecidos pela BlackBelt para academias';
COMMENT ON TABLE public.subscriptions IS 'Assinaturas das academias (B2B - BlackBelt cobrando academias)';
COMMENT ON TABLE public.payment_history IS 'Histórico de pagamentos das assinaturas';

COMMENT ON COLUMN public.subscriptions.status IS 'Status: trialing (trial ativo), active (pago), past_due (atrasado), canceled (cancelado), unpaid (não pago)';
COMMENT ON COLUMN public.subscriptions.cancel_at_period_end IS 'Se TRUE, cancela ao fim do período atual (não renova)';
