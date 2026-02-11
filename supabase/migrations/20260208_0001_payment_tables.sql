-- Sistema de Pagamentos - Tabelas, RLS, Índices e Views
-- DojoFlow - Integração com Efí (Gerencianet)
-- Criado em: 2026-02-08

begin;

--------------------------------------------------------------------------------
-- 1. ACADEMY_EFI_ACCOUNTS
-- Armazena credenciais da conta Efí de cada academia
-- Apenas o owner da academia pode visualizar/gerenciar
--------------------------------------------------------------------------------

create table if not exists public.academy_efi_accounts (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete cascade,
  efi_account_id text,                    -- ID da conta na Efí
  efi_credentials_encrypted text,         -- JSON com credenciais (client_id, client_secret) encriptado
  status text not null default 'pending'
    check (status in ('pending', 'active', 'suspended', 'error')),
  status_message text,                    -- Mensagem de erro ou informação adicional
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Garantir que cada academia tenha no máximo uma conta Efí
create unique index if not exists idx_academy_efi_accounts_academy_id
  on public.academy_efi_accounts(academy_id);

-- Comentário na tabela
comment on table public.academy_efi_accounts is 
  'Contas Efí (Gerencianet) vinculadas a cada academia para processamento de pagamentos';

--------------------------------------------------------------------------------
-- 2. ACADEMY_PLANS
-- Planos de mensalidade oferecidos por cada academia
--------------------------------------------------------------------------------

create table if not exists public.academy_plans (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete cascade,
  name text not null,                     -- Ex: "Plano Mensal", "Plano Trimestral VIP"
  description text,                       -- Descrição do plano
  price_cents integer not null check (price_cents > 0),  -- Valor em centavos (ex: 15000 = R$ 150,00)
  periodicity text not null
    check (periodicity in ('MENSAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índice para buscar planos ativos de uma academia
create index if not exists idx_academy_plans_academy_active
  on public.academy_plans(academy_id, is_active);

comment on table public.academy_plans is 
  'Planos de mensalidade oferecidos por cada academia';

--------------------------------------------------------------------------------
-- 3. SUBSCRIPTIONS
-- Assinaturas dos alunos (vínculo aluno-plano)
--------------------------------------------------------------------------------

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id),
  user_id uuid not null references public.profiles(id),
  plan_id uuid not null references public.academy_plans(id),
  efi_rec_id text,                        -- ID da cobrança recorrente na Efí
  status text not null default 'pending'
    check (status in ('pending', 'awaiting_authorization', 'active', 'cancelled', 'suspended', 'expired')),
  started_at timestamptz,                 -- Quando a assinatura iniciou
  cancelled_at timestamptz,               -- Quando foi cancelada (se aplicável)
  cancel_reason text,                     -- Motivo do cancelamento
  next_billing_at timestamptz,            -- Próxima cobrança prevista
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índices para queries frequentes
create index if not exists idx_subscriptions_user_id
  on public.subscriptions(user_id);

create index if not exists idx_subscriptions_academy_id
  on public.subscriptions(academy_id);

create index if not exists idx_subscriptions_status
  on public.subscriptions(status);

-- Índice composto para buscar assinatura ativa do usuário na academia
create index if not exists idx_subscriptions_user_academy_status
  on public.subscriptions(user_id, academy_id, status);

comment on table public.subscriptions is 
  'Assinaturas dos alunos vinculando-os aos planos das academias';

--------------------------------------------------------------------------------
-- 4. PAYMENTS
-- Histórico de pagamentos (cada cobrança/transação)
--------------------------------------------------------------------------------

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references public.subscriptions(id),  -- Pode ser null para pagamentos avulsos
  academy_id uuid not null references public.academies(id),
  user_id uuid not null references public.profiles(id),
  efi_txid text,                          -- ID da transação PIX na Efí
  efi_e2e_id text,                        -- End-to-end ID do PIX
  amount_cents integer not null,          -- Valor total em centavos
  split_academy_cents integer,            -- Parte que vai para a academia
  split_platform_cents integer,           -- Taxa da plataforma (DojoFlow)
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'confirmed', 'failed', 'refunded')),
  paid_at timestamptz,                    -- Quando foi confirmado
  failed_at timestamptz,                  -- Quando falhou
  failure_reason text,                    -- Motivo da falha
  metadata jsonb,                         -- Dados adicionais (webhook payload, etc)
  created_at timestamptz not null default now()
);

-- Índices para queries frequentes
create index if not exists idx_payments_subscription_id
  on public.payments(subscription_id);

create index if not exists idx_payments_academy_id
  on public.payments(academy_id);

create index if not exists idx_payments_user_id
  on public.payments(user_id);

create index if not exists idx_payments_efi_txid
  on public.payments(efi_txid);

create index if not exists idx_payments_status
  on public.payments(status);

-- Índice para buscar pagamentos recentes de uma academia
create index if not exists idx_payments_academy_created
  on public.payments(academy_id, created_at desc);

comment on table public.payments is 
  'Histórico de pagamentos PIX processados via Efí';

--------------------------------------------------------------------------------
-- 5. FUNÇÕES AUXILIARES
--------------------------------------------------------------------------------

-- Função para verificar se usuário é owner da academia
create or replace function public.is_academy_owner(p_academy_id uuid)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 
    from public.academies 
    where id = p_academy_id 
      and owner_id = auth.uid()
  );
$$;

-- Função para verificar se usuário é membro da academia
create or replace function public.is_academy_member(p_academy_id uuid)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 
    from public.academy_members 
    where academy_id = p_academy_id 
      and user_id = auth.uid()
  );
$$;

--------------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY - ACADEMY_EFI_ACCOUNTS
-- Apenas o owner da academia pode ver/gerenciar credenciais
--------------------------------------------------------------------------------

alter table public.academy_efi_accounts enable row level security;

drop policy if exists efi_accounts_select_owner on public.academy_efi_accounts;
create policy efi_accounts_select_owner
  on public.academy_efi_accounts for select
  to authenticated
  using (public.is_academy_owner(academy_id));

drop policy if exists efi_accounts_insert_owner on public.academy_efi_accounts;
create policy efi_accounts_insert_owner
  on public.academy_efi_accounts for insert
  to authenticated
  with check (public.is_academy_owner(academy_id));

drop policy if exists efi_accounts_update_owner on public.academy_efi_accounts;
create policy efi_accounts_update_owner
  on public.academy_efi_accounts for update
  to authenticated
  using (public.is_academy_owner(academy_id))
  with check (public.is_academy_owner(academy_id));

drop policy if exists efi_accounts_delete_owner on public.academy_efi_accounts;
create policy efi_accounts_delete_owner
  on public.academy_efi_accounts for delete
  to authenticated
  using (public.is_academy_owner(academy_id));

--------------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY - ACADEMY_PLANS
-- Membros e owner veem planos ativos, apenas owner gerencia
--------------------------------------------------------------------------------

alter table public.academy_plans enable row level security;

-- SELECT: membros veem planos ativos, owner vê todos
drop policy if exists plans_select_member_or_owner on public.academy_plans;
create policy plans_select_member_or_owner
  on public.academy_plans for select
  to authenticated
  using (
    -- Owner vê todos os planos
    public.is_academy_owner(academy_id)
    -- Membros veem apenas planos ativos
    or (is_active = true and public.is_academy_member(academy_id))
  );

-- INSERT: apenas owner
drop policy if exists plans_insert_owner on public.academy_plans;
create policy plans_insert_owner
  on public.academy_plans for insert
  to authenticated
  with check (public.is_academy_owner(academy_id));

-- UPDATE: apenas owner
drop policy if exists plans_update_owner on public.academy_plans;
create policy plans_update_owner
  on public.academy_plans for update
  to authenticated
  using (public.is_academy_owner(academy_id))
  with check (public.is_academy_owner(academy_id));

-- DELETE: apenas owner
drop policy if exists plans_delete_owner on public.academy_plans;
create policy plans_delete_owner
  on public.academy_plans for delete
  to authenticated
  using (public.is_academy_owner(academy_id));

--------------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY - SUBSCRIPTIONS
-- Usuário vê próprias assinaturas, owner vê todas da academia
--------------------------------------------------------------------------------

alter table public.subscriptions enable row level security;

-- SELECT: próprio usuário ou owner da academia
drop policy if exists subscriptions_select_self_or_owner on public.subscriptions;
create policy subscriptions_select_self_or_owner
  on public.subscriptions for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_academy_owner(academy_id)
  );

-- INSERT: próprio usuário (para assinar) ou owner (para criar assinatura)
drop policy if exists subscriptions_insert_self_or_owner on public.subscriptions;
create policy subscriptions_insert_self_or_owner
  on public.subscriptions for insert
  to authenticated
  with check (
    user_id = auth.uid()
    or public.is_academy_owner(academy_id)
  );

-- UPDATE: apenas owner da academia (para gerenciar status)
drop policy if exists subscriptions_update_owner on public.subscriptions;
create policy subscriptions_update_owner
  on public.subscriptions for update
  to authenticated
  using (public.is_academy_owner(academy_id))
  with check (public.is_academy_owner(academy_id));

-- DELETE: apenas owner da academia
drop policy if exists subscriptions_delete_owner on public.subscriptions;
create policy subscriptions_delete_owner
  on public.subscriptions for delete
  to authenticated
  using (public.is_academy_owner(academy_id));

--------------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY - PAYMENTS
-- Usuário vê próprios pagamentos, owner vê todos da academia
--------------------------------------------------------------------------------

alter table public.payments enable row level security;

-- SELECT: próprio usuário ou owner da academia
drop policy if exists payments_select_self_or_owner on public.payments;
create policy payments_select_self_or_owner
  on public.payments for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_academy_owner(academy_id)
  );

-- INSERT: via backend/service_role (não direto pelo usuário)
-- Por segurança, apenas service_role pode inserir pagamentos
drop policy if exists payments_insert_service on public.payments;
create policy payments_insert_service
  on public.payments for insert
  to service_role
  with check (true);

-- UPDATE: via backend/service_role
drop policy if exists payments_update_service on public.payments;
create policy payments_update_service
  on public.payments for update
  to service_role
  using (true)
  with check (true);

-- DELETE: desabilitado (pagamentos são históricos)
-- Não criamos policy de delete para authenticated

--------------------------------------------------------------------------------
-- 10. VIEW - STUDENT_PAYMENT_STATUS
-- Retorna status consolidado do aluno: paid, due_soon, overdue, no_subscription
--------------------------------------------------------------------------------

drop view if exists public.student_payment_status;
create or replace view public.student_payment_status as
select
  s.id as subscription_id,
  s.academy_id,
  s.user_id,
  s.plan_id,
  s.status as subscription_status,
  s.next_billing_at,
  p.full_name,
  ap.name as plan_name,
  ap.price_cents,
  -- Último pagamento confirmado
  latest_payment.paid_at as last_paid_at,
  latest_payment.amount_cents as last_amount_cents,
  -- Status calculado
  case
    -- Assinatura não está ativa
    when s.status != 'active' then 'inactive'
    -- Sem data de próxima cobrança definida
    when s.next_billing_at is null then 'unknown'
    -- Pagamento vencido (mais de 1 dia após a data prevista)
    when s.next_billing_at < (now() - interval '1 day') then 'overdue'
    -- Pagamento próximo (nos próximos 7 dias)
    when s.next_billing_at <= (now() + interval '7 days') then 'due_soon'
    -- Em dia
    else 'paid'
  end as payment_status,
  -- Dias até/desde o vencimento
  case
    when s.next_billing_at is not null then
      extract(day from s.next_billing_at - now())::integer
    else null
  end as days_until_due
from public.subscriptions s
inner join public.profiles p on p.id = s.user_id
inner join public.academy_plans ap on ap.id = s.plan_id
left join lateral (
  select paid_at, amount_cents
  from public.payments
  where subscription_id = s.id
    and status = 'confirmed'
  order by paid_at desc
  limit 1
) latest_payment on true;

comment on view public.student_payment_status is 
  'View consolidada do status de pagamento de cada aluno assinante';

-- Permissões na view (segue RLS das tabelas subjacentes)
grant select on public.student_payment_status to authenticated;

--------------------------------------------------------------------------------
-- 11. TRIGGERS PARA UPDATED_AT
--------------------------------------------------------------------------------

-- Função genérica para atualizar updated_at
create or replace function public.trigger_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger para academy_efi_accounts
drop trigger if exists set_updated_at_academy_efi_accounts on public.academy_efi_accounts;
create trigger set_updated_at_academy_efi_accounts
  before update on public.academy_efi_accounts
  for each row
  execute function public.trigger_set_updated_at();

-- Trigger para academy_plans
drop trigger if exists set_updated_at_academy_plans on public.academy_plans;
create trigger set_updated_at_academy_plans
  before update on public.academy_plans
  for each row
  execute function public.trigger_set_updated_at();

-- Trigger para subscriptions
drop trigger if exists set_updated_at_subscriptions on public.subscriptions;
create trigger set_updated_at_subscriptions
  before update on public.subscriptions
  for each row
  execute function public.trigger_set_updated_at();

commit;
