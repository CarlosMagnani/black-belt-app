# DojoFlow — Plano de Implementação (Backlog → MVP Validado)

Este plano organiza o que falta fazer em **fases incrementais**, priorizando **validar o MVP** com o mínimo de risco e com **base na arquitetura já existente** (Expo Router + NativeWind + Supabase + ports/adapters).  
**Objetivo final do MVP:** professor/dono cadastra a academia + grade de horários; aluno entra com invite code, escolhe faixa/graus e consegue fazer **check-in** em um treino.

---

## Princípios de execução

- **Iterar por valor:** cada fase entrega algo utilizável e testável.
- **Sem quebrar o que já funciona:** alterações em DB e tipos devem ser retrocompatíveis quando possível.
- **Camada de domínio protegida:** UI → hooks/use-cases → **ports** → infra (Supabase). Isso facilita trocar Supabase depois.
- **RLS com cuidado:** evitar políticas com subqueries recursivas (como o erro de recursion em `academy_members`).

---

## Estado atual (assumido pelo contexto do projeto)

- Tabelas principais: `profiles`, `academies`, `academy_members`.
- Fluxos já funcionando: login, join academy por invite code, criação de academy, select básico.
- Estrutura de UI e tokens em `agent_v0.3.md` (guia do projeto).
- Início do “sistema de agenda” já previsto: `academy_class_schedule` (ou equivalente).

---

## Visão de alto nível (roadmap)

### Fase 0 — Ajustes de base (1–2 ciclos curtos)
**Meta:** deixar o projeto pronto para crescer sem retrabalho.

**Entregas**
- Revisar schema do Supabase e aplicar migrations (SQL versionado).
- Centralizar e tipar modelos no app (types + mappers).
- Padronizar e documentar RLS “sem recursão”.
- Instrumentar erros (logs e mensagens amigáveis no app).

**Critérios de aceite**
- `select` em `academies` e `academy_members` funciona via client com RLS ok.
- `profiles` não quebra o signup (colunas corretas / trigger ok).
- `tsc --noEmit` passa sem erros.

---

### Fase 1 — Perfil do usuário completo + Faixa/Graus (core do aluno)
**Meta:** dados do aluno completos e renderizados no app.

**Backlog dessa fase**
1) **Cadastro mais extenso do usuário**
- Primeiro nome (`first_name`), sobrenome (`last_name`) → `full_name` derivado
- `avatar_url` (upload opcional)
- `birth_date`
- `federation_number` (opcional)

2) **Selecionar faixa e graus**
- UI no primeiro acesso (ou tela de edição do perfil)
- Persistir em `profiles` (`current_belt`, `belt_degree`)

**Critérios de aceite**
- Perfil exibe `full_name`, foto (ou placeholder), faixa e graus.
- Faixa/graus editáveis pelo aluno (por enquanto) sem quebrar RLS.

---

### Fase 2 — Diretório da academia (membros + perfis)
**Meta:** aluno vê quem treina na academia e acessa perfis básicos.

**Backlog dessa fase**
- Tela “Integrantes” (lista) com:
  - avatar, nome, faixa, graus (badge + belt icon)
- Tela “Perfil do integrante” (readonly)
- Query baseada em `academy_members` + `profiles` (join via RLS/edge ou duas queries)

**Critérios de aceite**
- Listagem funciona com RLS: aluno só vê membros da própria academia.
- UI responsiva (mobile + web/desktop).

---

### Fase 3 — Grade de aulas + Agenda do aluno (leitura)
**Meta:** aluno vê agenda semanal (dados inseridos manualmente no Supabase).

**Backlog dessa fase**
- Finalizar tabela `academy_class_schedule` (dias/horários/instrutor/modalidade/capacidade)
- Tela “Agenda” semanal (componente leve, sem libs pesadas)
- Home mostra preview “Próximos treinos”

**Critérios de aceite**
- O aluno visualiza corretamente aulas por dia/semana.
- Estado vazio e loading bem resolvidos.

---

### Fase 4 — Check-in funcional (MVP real)
**Meta:** check-in realmente registra presença e conta para progresso.

**Backlog dessa fase**
- Criar tabela de presença: `attendance` (ou `checkins`)
- Vincular check-in a:
  - `academy_id`, `user_id`, `schedule_id` (opcional), `checked_in_at`
- Regras de validação:
  - checar se usuário é membro daquela academy
  - opcional: limitar 1 check-in por aula/dia
- UI: botão “Fazer check-in no tatame” (Home) → confirma e salva
- Atualizar contadores de progresso (mock → real):
  - aulas do “próximo grau” e total para faixa (modelos simples primeiro)

**Critérios de aceite**
- Check-in cria registro no banco com RLS ok.
- Home reflete progresso (mesmo que com regra simples inicial).
- Teste manual confirma que não duplica check-in indevido (ou duplica com aviso).

---

### Fase 5 — Loja da academia (MVP-lite)
**Meta:** aluno vê produtos e “solicita” para o professor (sem e-commerce).

**Backlog dessa fase**
- Tabela `academy_products` (nome, preço, estoque opcional, imagem)
- Tela “Loja” (grid/cards)
- “Solicitar”:
  - opção A: abre link `wa.me` com mensagem preformatada (mais barato e rápido)
  - opção B: cria tabela `product_requests` para o professor ver depois (para fase professor)

**Critérios de aceite**
- Produto lista corretamente por `academy_id`.
- Botão “Solicitar” gera mensagem WhatsApp com dados do produto.

---

### Fase 6 — Competições do usuário (perfil enriquecido)
**Meta:** aluno registra e visualiza histórico de competições (simples).

**Backlog dessa fase**
- Tabelas:
  - `competitions` (id, name, date, city, organizer)
  - `profile_competitions` (user_id, competition_id, category, result, notes)
- UI:
  - bloco no perfil “Competições” (listar + adicionar)
  - (opcional) upload de foto/medalha depois

**Critérios de aceite**
- CRUD básico do aluno para as próprias competições (RLS: owner-only).

---

### Fase 7 — Lado dono/professor (pós-MVP)
**Meta:** definir o escopo real do “painel de dono” e validar necessidade de 2º app.

**Recomendação de produto**
- **Não criar 2º aplicativo agora.**  
  Use **o mesmo app** com **rotas condicionais por role** (student/professor/owner).  
  Só considere outro app se:
  - houver necessidade de distribuição separada (loja/MDM), ou
  - UX e permissões ficarem confusas demais.

**Backlog inicial do professor/dono**
- Cadastrar grade de aulas no app (CRUD `academy_class_schedule`)
- Ver membros + editar faixa/graus do aluno (role-based permission)
- Aprovar/visualizar check-ins e presença (se precisar)
- Gerenciar loja (CRUD de produtos)

**Critérios de aceite**
- Owner vê painel e consegue manter grade + alunos sem quebrar a experiência do aluno.

---

## Revisão do Supabase (tabelas e colunas) — proposta prática

> Ajuste nomes conforme o que você já tem; a ideia é evitar rework.

### `profiles` (expandir)
- `id uuid` (PK, = auth.uid())
- `email text`
- `first_name text`
- `last_name text`
- `full_name text` (gerado/atualizado via trigger ou no app)
- `avatar_url text` (nullable)
- `birth_date date` (nullable)
- `federation_number text` (nullable)
- `role text` ('student' | 'professor' | 'owner')
- `current_belt text` (Branca/Azul/Roxa/Marrom/Preta/Coral/Vermelha)
- `belt_degree int` (nullable)
- timestamps

### `academy_members` (já existe)
- `academy_id uuid`
- `user_id uuid`
- `joined_at timestamptz`

### `academy_class_schedule` (agenda)
- `id uuid` PK
- `academy_id uuid`
- `weekday int` (0–6) ou `text` ('mon'...'sun')
- `start_time time`
- `end_time time`
- `title text` (ex: “Jiu-Jitsu”)
- `instructor_name text` (por enquanto)
- `capacity int` (nullable)
- `location text` (nullable)
- timestamps

### `attendance` (check-in)
- `id uuid` PK
- `academy_id uuid`
- `user_id uuid`
- `schedule_id uuid` (nullable)
- `checked_in_at timestamptz`
- `notes text` (nullable)

### Loja (fase 5)
- `academy_products` (academy_id, name, price_cents, image_url, stock nullable, active bool)

### Competições (fase 6)
- `competitions`
- `profile_competitions`

---

## RLS (linhas gerais para evitar recursão)

- `academy_members`: policy simples por `user_id = auth.uid()` para SELECT/INSERT.
- `academies`: SELECT permitido para:
  - owner (`owner_id = auth.uid()`)
  - membros (via EXISTS em `academy_members`), **mas cuidado para não gerar recursão**.
- `academy_class_schedule`: SELECT permitido para owner e membros (EXISTS em `academy_members`).
- `attendance`: INSERT/SELECT permitido para o próprio usuário (user_id = auth.uid()) e/ou owner.

> Evitar: policy em `academy_members` que dependa de uma subquery que volta em `academy_members` de forma indireta.

---

## Ordem recomendada de implementação (checklist executável)

### Sprint 0 (Base)
- [ ] Criar pasta `/supabase/migrations` e versionar SQL
- [ ] Atualizar tipos TS (models) e mappers
- [ ] Revisar triggers do signup (profiles) e colunas

### Sprint 1 (Perfil + Faixa/Graus)
- [ ] Expandir `profiles` (first/last, birth_date, federation_number, avatar_url, belt_degree)
- [ ] UI: Editar perfil + selecionar faixa/graus
- [ ] Belt components (Badge/Icon) consistentes e tipados

### Sprint 2 (Integrantes)
- [ ] Tela listagem de membros + perfil readonly
- [ ] Queries com RLS ok

### Sprint 3 (Agenda)
- [ ] Tabela schedule + listagem semanal + preview na Home

### Sprint 4 (Check-in)
- [ ] Tabela attendance + fluxo de check-in + validações
- [ ] Progresso real baseado em attendance (regra simples inicial)

### Sprint 5 (Loja)
- [ ] Listar produtos + solicitar via WhatsApp (deep link)

### Sprint 6 (Competições)
- [ ] CRUD simples do aluno para competições

### Sprint 7 (Owner/Professor)
- [ ] Definir escopo mínimo do painel do dono
- [ ] CRUD schedule + editar faixa do aluno + ver check-ins

---

## Definição de “MVP Finalizado” (sua regra)

O MVP está finalizado quando:
- ✅ dono/professor consegue **cadastrar academia** e **grade de horários**
- ✅ aluno consegue **criar conta**, **entrar pelo código**, **selecionar faixa/graus**
- ✅ aluno consegue **ver agenda** e **fazer check-in** (persistindo no DB)
- ✅ telas principais do aluno (Home/Agenda/Perfil) estão consistentes e responsivas

---

## Riscos e decisões (importantes)

- **Abandonar Supabase depois:** mantenha ports/adapters rígidos; não acople UI ao Supabase.
- **RLS complexa:** comece simples e expanda quando entrar no painel do dono.
- **Check-in real:** se for QR/geo, vira fase 2.0; MVP pode ser “confirmar presença” com validações simples.
