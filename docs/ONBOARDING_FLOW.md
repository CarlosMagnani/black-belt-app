# BlackBelt - Fluxo de Onboarding

## Visão Geral

O fluxo de onboarding guia novos usuários desde o cadastro até a entrada na academia (alunos) ou criação de academia (professores).

## Fluxo Completo

```
[/auth] → [/onboarding] → [/join-academy] ou [/create-academy] → [Home]
```

### 1. Autenticação (`/auth`)

**Componentes:** Tabs "Entrar" / "Criar Conta"

**Campos:**
- Email
- Senha
- Confirmar Senha (apenas em "Criar Conta")

**Validações:**
- Email válido
- Senha mínimo 6 caracteres
- Senhas devem coincidir (criar conta)

**Próximo passo:** Redireciona para `/` que detecta se precisa de onboarding

---

### 2. Onboarding (`/onboarding`) - 4 Steps

#### Step 1: Escolha de Perfil
- **Título:** "Como você vai usar o BlackBelt?"
- **Opções:**
  - "Sou Professor / Dono" → `role: "professor"`
  - "Sou Aluno" → `role: "student"`
- **Componente:** `RoleCard`

#### Step 2: Dados Pessoais
- **Título:** "Dados pessoais"
- **Campos:**
  - Primeiro nome (obrigatório)
  - Sobrenome (obrigatório)
  - Data de nascimento (obrigatório)
  - Sexo: M / F / Outro (chips)

#### Step 3: Sua Faixa
- **Título:** "Sua faixa"
- **Componentes:**
  - `BeltSelector` - Grid de faixas (Branca, Azul, Roxa, Marrom, Preta)
  - `DegreeSelector` - Seletor de graus (0-4)

#### Step 4: Foto de Perfil
- **Título:** "Foto de perfil"
- **Componente:** `Avatar` (editable)
- **Ação:** Upload para Supabase Storage
- **Opcional:** Pode pular

**Ao finalizar:**
- Salva perfil via `blackBeltAdapters.profiles.upsertProfile()`
- Redireciona:
  - Aluno → `/join-academy`
  - Professor → `/create-academy`

---

### 3a. Entrar em Academia - Aluno (`/join-academy`)

**Título:** "Entrar em uma academia"

**Funcionalidades:**
- Input de código (7 caracteres, formato ABC-1234)
- Busca automática ao digitar código completo
- Preview card da academia encontrada
- Botão "Confirmar Entrada"

**Integração:**
- `blackBeltAdapters.academies.getByInviteCode()` - busca
- `blackBeltAdapters.memberships.addMember()` - entrada

**Próximo:** `/home` (área do aluno)

---

### 3b. Criar Academia - Professor (`/create-academy`)

**Título:** "Criar sua academia"

**Campos:**
- Nome da academia (obrigatório, mín. 3 chars)
- Cidade (opcional)

**Geração de Código:**
- Formato: `XXX-9999` (3 letras + 4 dígitos)
- Verificação de unicidade automática

**Após criar:**
- Exibe card da academia com código
- Botão "Copiar código"
- Dica para compartilhar

**Próximo:** `/(owner)/owner-home`

---

## Arquitetura

### Arquivos Modificados/Criados

```
app/
├── auth.tsx              # Tela de login/registro
├── onboarding.tsx        # Wizard de 4 steps
├── join-academy.tsx      # Aluno entra com código
└── create-academy.tsx    # Professor cria academia
```

### Componentes Utilizados

```
components/
├── ui/
│   ├── Avatar.tsx        # Upload de foto
│   ├── BeltSelector.tsx  # Seleção de faixa
│   ├── DateInput.tsx     # Input de data
│   ├── DegreeSelector.tsx # Graus da faixa
│   └── TextField.tsx     # Input genérico
└── RoleCard.tsx          # Cards professor/aluno
```

### Adapters Integrados

- `blackBeltAdapters.auth` - Autenticação
- `blackBeltAdapters.profiles` - Perfis de usuário
- `blackBeltAdapters.academies` - Gestão de academias
- `blackBeltAdapters.memberships` - Membros/alunos

---

## Estilo Visual

### Cores
- Background: `bg-app-dark` (#0A0F1A)
- Primary: `brand-500` (#6366F1) / `brand-600` (#4F46E5)
- Accent: Gradient roxo (#7C3AED → #6366F1)
- Texto: `text-primary-dark` (#F8FAFC)

### Componentes
- Botões principais: `LinearGradient` com cores roxas
- Cards: `bg-surface-dark` com border sutil
- Inputs: `bg-surface-dark` com border `subtle-dark`
- Progress bar: Segmentos arredondados

### Efeitos
- Background circles com blur (gradientes decorativos)
- Transições suaves nos botões (opacity on press)

---

## Fluxo de Navegação (Mermaid)

```mermaid
flowchart TD
    A[/ Index /] --> B{Tem sessão?}
    B -->|Não| C[/auth]
    B -->|Sim| D{Tem perfil completo?}
    D -->|Não| E[/onboarding]
    D -->|Sim| F{É aluno?}
    F -->|Sim| G{Tem academia?}
    F -->|Não| H{Tem academia própria?}
    G -->|Não| I[/join-academy]
    G -->|Sim| J[/home]
    H -->|Não| K[/create-academy]
    H -->|Sim| L[/owner-home]
    
    C --> A
    E --> I
    E --> K
    I --> J
    K --> L
```

---

## Dependências

```bash
expo-linear-gradient  # Gradientes nos botões
expo-clipboard        # Copiar código de convite
expo-image-picker     # Upload de avatar
```
