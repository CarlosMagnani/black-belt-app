-- ============================================================
-- MIGRATION: Academy Subscriptions (B2B - BlackBelt → Academias)
-- Data: 2026-02-11
-- Sprint: 01 - Monetização
-- Baseado: DATA_MODEL.md do backend Go + melhorias
-- ============================================================

-- ============================================================
-- ENUMS
-- ============================================================

DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM (
        'trialing',     -- Em período de trial
        'active',       -- Pagamento em dia
        'past_due',     -- Pagamento atrasado (grace period)
        'canceled',     -- Cancelada
        'expired'       -- Trial expirado sem conversão
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_gateway AS ENUM (
        'pix_auto',     -- PIX Automático (Efí Bank)
        'stripe'        -- Stripe Billing
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM (
        'pending',
        'processing',
        'succeeded',
        'failed',
        'refunded'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE webhook_status AS ENUM (
        'pending',
        'processing',
        'processed',
        'failed',
        'skipped'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- SUBSCRIPTION PLANS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identification
    name TEXT NOT NULL,              
    slug TEXT UNIQUE NOT NULL,       
    description TEXT,
    
    -- Pricing (centavos)
    price_monthly INTEGER NOT NULL CHECK (price_monthly >= 0),
    price_yearly INTEGER CHECK (price_yearly >= 0),
    currency TEXT DEFAULT 'BRL',
    
    -- Limits
    max_students INTEGER,            -- NULL = unlimited
    max_professors INTEGER,
    max_locations INTEGER DEFAULT 1,
    
    -- Features (JSON array)
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Stripe integration
    stripe_price_id_monthly TEXT,
    stripe_price_id_yearly TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active 
    ON public.subscription_plans(is_active) 
    WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_subscription_plans_slug 
    ON public.subscription_plans(slug);

-- Trigger updated_at
CREATE TRIGGER update_subscription_plans_updated_at
    BEFORE UPDATE ON public.subscription_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SUBSCRIPTIONS (Academias assinando BlackBelt)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relationships
    academy_id UUID UNIQUE NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
    
    -- Status
    status subscription_status NOT NULL DEFAULT 'trialing',
    
    -- Trial
    trial_start_date TIMESTAMPTZ,
    trial_end_date TIMESTAMPTZ,
    
    -- Gateway info
    payment_gateway payment_gateway,
    
    -- PIX Automático fields (Efí Bank)
    pix_authorization_id TEXT,      -- ID da autorização recorrente
    pix_recurrence_id TEXT,         -- ID da recorrência configurada
    pix_customer_cpf TEXT,          -- CPF do responsável
    pix_customer_name TEXT,         -- Nome do responsável
    
    -- Stripe fields
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT UNIQUE,
    stripe_price_id TEXT,
    
    -- Billing period
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    
    -- Cancellation
    canceled_at TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    cancel_reason TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT trial_dates_valid 
        CHECK (trial_end_date IS NULL OR trial_end_date > trial_start_date),
    CONSTRAINT period_dates_valid 
        CHECK (current_period_end IS NULL OR current_period_end > current_period_start)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_subscriptions_academy 
    ON public.subscriptions(academy_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_plan 
    ON public.subscriptions(plan_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_status 
    ON public.subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_end 
    ON public.subscriptions(trial_end_date) 
    WHERE status = 'trialing';

CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end 
    ON public.subscriptions(current_period_end)
    WHERE status IN ('active', 'past_due');

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe 
    ON public.subscriptions(stripe_subscription_id) 
    WHERE stripe_subscription_id IS NOT NULL;

-- Trigger updated_at
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- PAYMENT HISTORY
-- ============================================================

CREATE TABLE IF NOT EXISTS public.payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relationships
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    academy_id UUID NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
    
    -- Amount (centavos)
    amount INTEGER NOT NULL CHECK (amount >= 0),
    currency TEXT DEFAULT 'BRL',
    
    -- Gateway info
    payment_gateway payment_gateway NOT NULL,
    gateway_payment_id TEXT,        -- PIX txid ou Stripe payment_intent_id
    gateway_charge_id TEXT,         -- ID da cobrança recorrente
    gateway_invoice_id TEXT,        -- Stripe invoice_id
    
    -- Status
    status payment_status NOT NULL DEFAULT 'pending',
    
    -- Details
    payment_method TEXT,            -- "pix" | "card"
    failure_reason TEXT,
    failure_code TEXT,
    
    -- Period covered
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    
    -- Timestamps
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_payment_history_subscription 
    ON public.payment_history(subscription_id);

CREATE INDEX IF NOT EXISTS idx_payment_history_academy 
    ON public.payment_history(academy_id);

CREATE INDEX IF NOT EXISTS idx_payment_history_status 
    ON public.payment_history(status);

CREATE INDEX IF NOT EXISTS idx_payment_history_gateway_id 
    ON public.payment_history(gateway_payment_id) 
    WHERE gateway_payment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payment_history_created 
    ON public.payment_history(created_at DESC);

-- ============================================================
-- WEBHOOK EVENTS (Auditoria)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Source
    gateway TEXT NOT NULL,          -- "pix_auto" | "stripe"
    
    -- Event info
    event_id TEXT UNIQUE NOT NULL,  -- ID do evento no gateway
    event_type TEXT NOT NULL,       -- Tipo do evento
    
    -- Payload
    payload JSONB NOT NULL,
    headers JSONB,                  -- Request headers (para validação)
    
    -- Processing
    status webhook_status NOT NULL DEFAULT 'pending',
    processed_at TIMESTAMPTZ,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    next_retry_at TIMESTAMPTZ,
    
    -- Timestamps
    received_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id 
    ON public.webhook_events(event_id);

CREATE INDEX IF NOT EXISTS idx_webhook_events_type 
    ON public.webhook_events(event_type);

CREATE INDEX IF NOT EXISTS idx_webhook_events_status 
    ON public.webhook_events(status);

CREATE INDEX IF NOT EXISTS idx_webhook_events_gateway 
    ON public.webhook_events(gateway);

CREATE INDEX IF NOT EXISTS idx_webhook_events_created 
    ON public.webhook_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_webhook_events_retry 
    ON public.webhook_events(next_retry_at) 
    WHERE status = 'failed' AND next_retry_at IS NOT NULL;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Subscription Plans: todos podem ver planos ativos
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active plans"
    ON public.subscription_plans FOR SELECT
    USING (is_active = TRUE);

-- Subscriptions: owner vê própria subscription
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view own subscription"
    ON public.subscriptions FOR SELECT
    USING (
        academy_id IN (
            SELECT id FROM public.academies WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Owners update own subscription"
    ON public.subscriptions FOR UPDATE
    USING (
        academy_id IN (
            SELECT id FROM public.academies WHERE owner_id = auth.uid()
        )
    );

-- Payment History: owner vê próprio histórico
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view own payment history"
    ON public.payment_history FOR SELECT
    USING (
        academy_id IN (
            SELECT id FROM public.academies WHERE owner_id = auth.uid()
        )
    );

-- Webhook Events: apenas via service role (sem RLS para service)
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Sem policies públicas - apenas service_role acessa

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Função para iniciar trial automaticamente ao criar academia
CREATE OR REPLACE FUNCTION create_trial_subscription()
RETURNS TRIGGER AS $$
DECLARE
    starter_plan_id UUID;
BEGIN
    -- Pega plano starter
    SELECT id INTO starter_plan_id
    FROM public.subscription_plans
    WHERE slug = 'starter' AND is_active = TRUE
    LIMIT 1;
    
    -- Se não encontrou, pega primeiro plano ativo
    IF starter_plan_id IS NULL THEN
        SELECT id INTO starter_plan_id
        FROM public.subscription_plans
        WHERE is_active = TRUE
        ORDER BY price_monthly
        LIMIT 1;
    END IF;
    
    -- Cria subscription em trial
    INSERT INTO public.subscriptions (
        academy_id,
        plan_id,
        status,
        trial_start_date,
        trial_end_date,
        current_period_start,
        current_period_end
    ) VALUES (
        NEW.id,
        starter_plan_id,
        'trialing',
        NOW(),
        NOW() + INTERVAL '20 days',
        NOW(),
        NOW() + INTERVAL '1 month'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: criar trial automaticamente
DROP TRIGGER IF EXISTS create_trial_on_academy_creation ON public.academies;
CREATE TRIGGER create_trial_on_academy_creation
    AFTER INSERT ON public.academies
    FOR EACH ROW
    EXECUTE FUNCTION create_trial_subscription();

-- ============================================================
-- SEED DATA (Planos)
-- ============================================================

-- Plano Starter (Básico)
INSERT INTO public.subscription_plans (
    name,
    slug,
    description,
    price_monthly,
    price_yearly,
    max_students,
    max_professors,
    max_locations,
    features,
    is_active
) VALUES (
    'Starter',
    'starter',
    'Ideal para academias pequenas iniciantes',
    9900,  -- R$ 99,00/mês
    NULL,  -- Sem opção anual
    50,
    2,
    1,
    '["Check-in ilimitado", "Agenda de aulas", "Perfis de alunos", "Suporte por email"]'::jsonb,
    TRUE
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    max_students = EXCLUDED.max_students,
    max_professors = EXCLUDED.max_professors,
    features = EXCLUDED.features,
    updated_at = NOW();

-- Plano Pro (Profissional)
INSERT INTO public.subscription_plans (
    name,
    slug,
    description,
    price_monthly,
    price_yearly,
    max_students,
    max_professors,
    max_locations,
    features,
    is_active
) VALUES (
    'Pro',
    'pro',
    'Para academias em crescimento',
    19900, -- R$ 199,00/mês
    190800, -- R$ 1.908,00/ano (20% desconto)
    200,
    5,
    1,
    '["Check-in ilimitado", "Agenda de aulas", "Perfis de alunos", "Loja integrada", "Relatórios avançados", "Suporte prioritário"]'::jsonb,
    TRUE
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    max_students = EXCLUDED.max_students,
    max_professors = EXCLUDED.max_professors,
    features = EXCLUDED.features,
    updated_at = NOW();

-- Plano Business (Empresarial)
INSERT INTO public.subscription_plans (
    name,
    slug,
    description,
    price_monthly,
    price_yearly,
    max_students,
    max_professors,
    max_locations,
    features,
    is_active
) VALUES (
    'Business',
    'business',
    'Para redes de academias e franquias',
    39900, -- R$ 399,00/mês
    382800, -- R$ 3.828,00/ano (20% desconto)
    NULL,  -- Ilimitado
    NULL,  -- Ilimitado
    10,
    '["Tudo do Pro", "Alunos ilimitados", "Professores ilimitados", "Multi-localização", "API completa", "Suporte 24/7", "Gerente de conta dedicado"]'::jsonb,
    TRUE
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    max_students = EXCLUDED.max_students,
    max_professors = EXCLUDED.max_professors,
    max_locations = EXCLUDED.max_locations,
    features = EXCLUDED.features,
    updated_at = NOW();

-- ============================================================
-- COMMENTS (Documentação)
-- ============================================================

COMMENT ON TABLE public.subscription_plans IS 'Planos de assinatura oferecidos pela BlackBelt para academias (B2B)';
COMMENT ON TABLE public.subscriptions IS 'Assinaturas das academias ao BlackBelt (monetização B2B)';
COMMENT ON TABLE public.payment_history IS 'Histórico de todos os pagamentos (sucesso e falhas)';
COMMENT ON TABLE public.webhook_events IS 'Auditoria de webhooks recebidos (PIX + Stripe)';

COMMENT ON COLUMN public.subscriptions.status IS 'Status: trialing, active, past_due, canceled, expired';
COMMENT ON COLUMN public.subscriptions.cancel_at_period_end IS 'Se TRUE, cancela ao fim do período (não renova)';
COMMENT ON COLUMN public.subscriptions.payment_gateway IS 'Gateway ativo: pix_auto (Efí) ou stripe';

COMMENT ON COLUMN public.webhook_events.retry_count IS 'Número de tentativas de processar o webhook';
COMMENT ON COLUMN public.webhook_events.next_retry_at IS 'Próxima tentativa (backoff exponencial)';
