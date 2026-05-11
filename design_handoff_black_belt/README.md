# Handoff: Black Belt — BJJ Academy App

## Overview
Black Belt is a mobile app prototype for managing a Brazilian Jiu-Jitsu academy. It splits onboarding by role (Master/owner vs. Aluno/student), then drops each role into a tailored home with role-specific tools: students see schedule, attendance streak, and belt progression; owners see academy pulse, live mat, roster snapshot, mensalidades (monthly revenue), promotion queue, and recent activity. A class-detail screen with a slide-to-confirm check-in is shared between flows.

The aesthetic is "premium fight-club" — refined, dark, cinematic. Heavy grotesk display type (Archivo Black) over neutral body (Inter) and JetBrains Mono accents, on near-black surfaces with a hot red (#FF3B3B) used sparingly for emphasis and live state. Sharp 0-radius edges, subtle film grain overlay, staggered fade-in transitions. Copy is mixed PT/EN — UI in English, BJJ vocabulary kept in Portuguese (faixa, tatame, professor, oss, mensalidade).

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes showing intended look and behavior, not production code to copy directly. The task is to **recreate these HTML designs in the target codebase's existing environment** (React Native, SwiftUI, Flutter, native iOS/Android, etc.) using its established patterns, navigation, and styling libraries. If no environment exists yet, choose the most appropriate framework for a mobile-first BJJ app and implement the designs there.

The prototype runs as React in-browser via Babel for rapid iteration only — do not ship Babel-in-browser. Treat each `Screen*` component as a *spec for one screen*, and each helper component (BeltVisual, BeltPicker, SlideToConfirm, AttendanceHero, OwnerPulse, etc.) as a *spec for one widget* that should be rebuilt as a real component in the target framework.

## Fidelity
**High-fidelity.** All colors, typography, spacing, micro-interactions, and copy are final. The developer should recreate the UI pixel-perfectly using the target codebase's existing libraries and patterns. Belt colors, the red accent, the type pairing, and the sharp-corner geometry are intentional brand decisions and should be preserved.

## Screens / Views

### 1. Splash / Role Split (`ScreenSplash`)
- **Purpose:** First launch — pick Master (academy owner) or Aluno (student).
- **Layout:** Vertical stack. Top 56% = hero block with stylized mat-tape stripes and the BLACK / BELT logo lockup. Bottom 44% = two role cards in a vertical stack at 24px page padding, with a "OSS · RESPECT THE ART" footer.
- **Components:**
  - **Hero block:** dark gradient (`#1a0000` → `#0A0A0A`) with a 22%-opacity radial red glow at 50% 38%; 12 horizontal mat-tape stripes at 6% opacity. Logo wordmark "BLACK / BELT" 76px Anton, plus a red 4×10px badge "BJJ ACADEMY OS" in JetBrains Mono 10px / 0.25em tracking.
  - **Role cards:** `RoleCard` — 1px line border (default `#242424`, hover `#FF3B3B`), 18px padding, 14px gap. 44×44 icon square (Crown for owner, Shield for student) with `--line-2` border. Stack of: kicker eyebrow ("01 / MASTER"), 22px Archivo Black title, 13px muted subtitle. Trailing arrow-up-right icon. On hover a 3px red bar slides in on the left edge.
- **Interactions:** Card hover reveals the red rail. Click pushes the corresponding onboarding route.

### 2. Master Onboarding (`ScreenOwner`) — 3 steps
Top header: 36×36 surface back button, eyebrow kicker "MASTER ONBOARDING", 4px progress bar split into 3 segments (red filled / `--line-2` empty), "ETAPA 01 / 03" mono caption.

- **Step 1 — Academy:** Display headline "Funde sua academia." with the second word in red. Inputs for academy name + city. A bb-card info pill explains Master role.
- **Step 2 — Profile:** "Quem é o professor?" Headline. Name input + the BeltPicker widget.
- **Step 3 — Invite reveal:** "Sua porta de entrada." Headline. Centerpiece is a code card with corner brackets, 30px JetBrains Mono code (e.g. `BB-BLAC-7K2`) and "VÁLIDO POR 30 DIAS · ROTACIONÁVEL" footer. Below: 50px height Copy + Share ghost buttons in a 2-col grid; QR preview card (52×52 white block with a deterministic 9×9 pseudo-QR derived from the code seed).
- **Bottom CTA:** Full-width 56px red primary "Continuar →" / on last step "Abrir Academia →".

### 3. Student Onboarding (`ScreenStudent`) — 3 steps
- **Step 1 — Code:** "Qual o código da sua academia?" 22px mono input with letter-spacing. Verify pill below shows three states: idle (grey), verifying (3 red dots loader, 1.2s blink), success (red 36px CheckIcon block + academy name + meta line "SÃO PAULO · 247 ALUNOS"). Below the verify pill, a dashed `--line-2` row offers "Ou escaneie o QR code do mural."
- **Step 2 — Profile:** Name + optional Apelido (nickname) inputs.
- **Step 3 — Belt:** Same BeltPicker widget as Master step 2.
- **Bottom CTA:** disabled until verified; on last step copy is "Entrar no Tatame".

### 4. Belt Picker (`BeltPicker`)
Reused in both onboardings. Components:
- **Big visual:** `BeltVisual large` — 44px tall belt strip with a black tip on the right (88px wide for large), white stripes inset 4px from top/bottom and 5px wide, spaced 12px apart; for the black belt the tip carries a 8px red bar on its right edge.
- **Label row:** "FAIXA <NAME>" + "<N> GRAUS" mono caption; on the right, 5 stripe-toggle buttons (4px wide × 26px tall — red when ≤ count, else `--line-2`).
- **Belt selector pills:** 5-column grid of buttons, each with a 28×8 colored swatch over a 9px mono label ("BRANCA / AZUL / ROXA / MARROM / PRETA"). Selected state: red border + surface bg.

### 5. Student Home (`ScreenStudentHome`)
Top bar: "SEXTA · 10 MAI" eyebrow + "OSS, LUCAS." 28px display title, with a bell icon button + 38×38 red-bordered avatar tile.
Body sections (vertical stack, scrolled):
- **AttendanceHero** — 12-day streak hero. Big 56px display number, red "DIAS" suffix, "Recorde pessoal: 18 dias" muted line. 56×56 flame icon with a `pulse-halo` (2.4s box-shadow expansion 0→18px, opacity 0.5→0). Below: 14-cell heat strip — fully red (trained), 25% red (planned), `--line` (rest); the most recent 7 days at full opacity, prior 7 at 0.6.
- **BeltProgress** — Card with two BeltVisual side-by-side (current `white/3` + target `blue/0` at 0.45 opacity), centered "━━━━ 41/60 AULAS ━━━━" mono. Below: 6px progress bar with linear-gradient from `--red-deep` to `--red`, with three 2px tick marks at 25/50/75% in `--bg`. Caption row: "FAIXA BRANCA · 3 GRAUS" / "+19 PARA AZUL" (red).
- **Today's classes section:** Eyebrow "HOJE NO TATAME" + "4 AULAS" title + "VER SEMANA →" red mono link. 4 ClassRow tiles.
- **ClassRow** — 1px line border (highlight class uses red-deep border + surface bg + red-tinted time block). Left: 76px time block with 22px display time + "60 MIN" mono caption. Middle: level/tag eyebrow + 17px title + meta row "Prof. <name> · <spots>/<total> vagas" with red number when occupancy > 85%. Right: 16px chevron in muted-2.
- **ThisMonthCard** — 3-column stat grid in a 1px line border: 14 AULAS / 21h NO TATAME / 3 ABERTOS.
- **Bottom tab bar (`BottomBar`):** 4 items — TATAME / AGENDA / EQUIPE / PERFIL — 18px outline icons, 9px mono label at 0.18em tracking, red when active. Padding `10px 0 28px` to clear iOS home indicator.

### 6. Owner Home / Master Dashboard (`ScreenOwnerHome`)
Top bar: red 9px mono "MASTER" badge, "BLACK BELT SP" eyebrow, "BOM DIA, CARLOS." 26px display title, bell + settings icon buttons.
Body sections:
- **OwnerPulse** — Card with bottom-right radial red glow. Left side: "OCUPAÇÃO MÉDIA" eyebrow, 56px display "78", red 22px "%", "↑ 12% vs. semana anterior" caption. Right side: "NO TATAME AGORA" eyebrow + pulse-halo dot + 28px "22" + "de 24 vagas". Below: 14-bar mini histogram (last 7 days = `--text` 0.7 opacity, today = red, older 7 = `--line-2`). Bottom mono row: "2 SEM ATRÁS" / "HOJE".
- **OwnerLiveMat** — Dramatic block with `linear-gradient(135deg, #1a0606, #0a0000)`, red-deep border, diagonal mat-tape stripes (rotate −12deg, 5% opacity). Top row: pulse-halo dot + "AO VIVO · MAT 1" red mono / "17 MIN RESTANTES" muted mono. 30px display headline "FUNDAMENTOS / 07:00 — 08:00". 4px progress bar at 72% red on `rgba(255,255,255,0.08)`. Bottom row: 4 stacked avatars (30×30, −8px overlap, 2px `#0a0000` border) + "22 alunos · 3 ausências" + red "CHAMADA" button (display 11px / 0.15em).
- **OwnerQuickActions** — 4-column grid. Each: icon (20px, 1.6 stroke), 11px display label, 8px mono sub. The Convite tile is accented (red-deep border + 8% red surface tint + red icon).
- **Today's schedule:** "HOJE NA AGENDA" / "4 AULAS" head + "VER SEMANA →" link. `OwnerClassRow` differs from student's: shows a 4px attendance bar inside the card with `--text` fill (or red when >85%), plus a "<N>% OCUP." mono caption. Highlight class uses red-deep border + red time text.
- **Roster snapshot:** Stacked horizontal 12px belt-distribution bar (segments proportional to count). Below: 5 rows, each with a 22×8 swatch (red tip rail on the black row), "FAIXA <NAME>" mono label, percentage, and 14px display count. Totals: 142/64/24/11/6 = 247.
- **RevenueCard:** "R$ 42,8K" 36px display + "↑ 8%" red. "Recebido em maio · projeção R$ 50,3K" caption. 8px stacked horizontal bar split RECEBIDO (`--text`) / PENDENTE (`--muted`) / ATRASADO (red). 3-col legend below with a 6×6 colored dot per item; ATRASADO value is rendered red.
- **PromotionsList:** 6 students ready to graduate. Row: 38×38 belt-color avatar (initials) with a 8px black tip rail. Right: name + "<N>% PRONTO" red mono → 3px progress bar (`--line` track, red fill) → "Para 4º grau · 41 aulas no nível" caption. 38×38 red square button with 2.4-stroke check icon to confirm.
- **ActivityFeed:** Last-24h list with leading colored dot (red for new/check-in, text for student check-in, muted for renewals/overdue), 13px text body with bold name, mono timestamp on the right.
- **OwnerTabBar:** 5 items — PAINEL / AGENDA / ALUNOS / CAIXA / PERFIL — same styling as student's BottomBar.

### 7. Class Detail + Check-in (`ScreenClass`)
- **Header (320px tall):** Same dark gradient + diagonal mat-tape stripes + red radial light at 70% 60%. Top controls: 38×38 black/glass back button, "● HOJE" red eyebrow. Bottom of header: level/tag/duration eyebrow, 44px display title (uppercase, line-height 0.9), 32px round red avatar with professor initials + 14px name.
- **Meta row:** 3-column 1px line grid — START time, MAT 1, occupancy — each with a 14px red icon, 18px display value, 9px mono label.
- **FOCO DA AULA:** 4 `Drill` rows — mono ordinal "01"–"04" (red on the highlighted "Técnica do dia"), 16px display title (with a red ● for the highlight), 12px muted sub. 1px line dividers between rows.
- **QUEM ESTÁ DENTRO:** 5 stacked 36×36 belt-colored avatars (−10px overlap, 2px `--surface` border) + "+ <N> ALUNOS" mono caption. Body line "Faixa-azul ↑ predominante · 4 mulheres · 6 competidores".
- **Check-in CTA:** `SlideToConfirm` — 64px-tall track with 1px line border, surface bg. 64×64 red thumb with `0 0 24px var(--red-glow)` shadow holds an arrow-right icon (22px / 2.2 stroke). Drag with pointer events: thumb x is clamped 0..(track-width − 64). On release at the end, snap to max and fire `onConfirm` 180ms later. Center label "ARRASTE PARA FAZER CHECK-IN →" fades from 1 to 0 as the thumb travels. Behind the thumb a `linear-gradient(90deg, var(--red-deep), transparent)` fill at 25% opacity grows with it. Footer mono caption "OSS · CHEGUE 10MIN ANTES".
- **Confirmed state (`CheckedInState`):** Replaces the slider. Solid red banner, 44×44 black square with 22px CheckIcon (#fff, 2.4 stroke), "NO TATAME · 19:00" 16px display + "Check-in confirmado. Aula #42 · +1 para faixa azul." sub. Trailing 36×36 black 30%-alpha close button.

## Interactions & Behavior

- **Navigation:** simple stack model — `splash → owner | student → owner-home | home`. Class detail pushes onto whichever home you're on. Back is always pop. Onboarding completion `reset()`s the stack.
- **Onboarding transitions:** every screen mount uses `page-enter` (320ms `cubic-bezier(0.2,0.8,0.2,1)`, slides 28px from the right + fade). Step content inside an onboarding screen uses `fade-in` (380ms ease, 6px y) and a `stagger` container delays children at 40/100/160/220/280/340ms. Re-keying on step change re-triggers the animation.
- **Live verification (student step 1):** `verify()` flips to verifying state, shows the dot loader 900ms, then to the success state. Triggered onBlur of the code input or once on mount when a code is preloaded.
- **Slide-to-confirm:** pointer-down captures, pointer-move clamps x to `[0, trackWidth - 64]`, pointer-up snaps back to 0 unless within 4px of max — then snaps to max and confirms after 180ms. `transition: none` while dragging, 0.25s ease on snap.
- **Pulse halo:** 2.4s ease-in-out infinite — `box-shadow` from `0 0 0 0 rgba(255,59,59,0.5)` to `0 0 0 18px rgba(255,59,59,0)`. Used on flame, live dots, avatar rings.
- **Dot loader:** 3 × 6px red dots blink with 1.2s infinite, each offset 200ms.
- **Hover states:** RoleCard and class rows lift border to red and surface tint; primary red button lifts 1px + adds a red glow.
- **Form inputs:** 56px height, 18px horizontal padding, 1px `--line` border, focus border `--red`. 17px Inter; the code input overrides to 22px JetBrains Mono with 0.1em tracking + uppercase.

## State Management

Per screen state lives locally:
- **Owner onboarding:** `step` (0..2), `academyName`, `city`, `profName`, `belt`, `stripes`. Invite code is derived: `BB-${name.slice(0,4).toUpperCase()}-7K2`.
- **Student onboarding:** `step`, `code`, `studentName`, `belt`, `stripes`, `verifying`, `verified`. Continue is disabled when on step 0 and `!verified`.
- **Class screen:** `checkedIn` boolean — toggled by SlideToConfirm.
- **App-level routing:** stack of `{name, ...payload}`. The class screen receives the selected class object as `top.cls`.

When porting: lift onboarding state to the navigation route's params or a per-flow context; the verify call should be the real "redeem invite" API; `onCheckedIn` should fire the create-attendance API and then dismiss back to the home.

## Design Tokens

```
--bg:        #0A0A0A   /* App background, status-bar safe area */
--bg-2:      #111111
--surface:   #161616   /* Card / input / icon-button bg */
--surface-2: #1C1C1E
--line:      #242424   /* Default 1px borders */
--line-2:    #2F2F2F   /* Stronger borders, ghost buttons */
--muted:     #6B6B6B
--muted-2:   #8E8E93   /* Body sub copy */
--text:      #F5F5F5   /* Primary text */
--text-2:    #C8C8C8

--red:       #FF3B3B   /* Brand red — accents, CTAs, live state */
--red-deep:  #C81E2D   /* Red gradient bottom, code-card border */
--red-glow:  rgba(255, 59, 59, 0.35)
--gold:      #C9A24A   /* Reserved (unused in current flow) */

--display:   'Archivo Black', 'Anton', system-ui, sans-serif
--body:      'Inter', -apple-system, system-ui, sans-serif
--mono:      'JetBrains Mono', ui-monospace, monospace
```

**Spacing:** page side padding 24px. Card padding 16–18px. Vertical section spacing 20–24px. Button height 56px primary / 50px ghost / 38px icon. Tab bar bottom safe-area 28px.

**Typography scale (display = Archivo Black, all uppercase, letter-spacing −0.01em, line-height 0.95):**
- Splash logo: 76px Anton
- Big screen headline: 38px display
- Section title: 22px display
- Hero number: 56px display
- Card title: 16–17px display
- Eyebrow: 11px JetBrains Mono / 0.2em tracking / uppercase / `--muted-2`
- Mono caption: 9–11px JetBrains Mono / 0.12–0.18em tracking
- Body: 13–14px Inter, color `--muted-2` for sub copy
- Form input value: 17px Inter

**Borders & corners:** sharp by default (border-radius 0). The Tweaks "Rounded" option globally adds 14px to buttons/inputs/cards — owner can opt in.

**Shadows:** primary red button hover `0 0 28px var(--red-glow)`. Slide thumb `0 0 24px var(--red-glow)`. No general drop shadows.

**Effects:** `bb-grain::after` lays an SVG fractalNoise overlay at 6% opacity, `mix-blend-mode: screen`, on every screen.

## Assets

- **Fonts:** Google Fonts — Archivo Black (display), Anton (alt display, used for the splash wordmark), Inter 300/400/500/600/700 (body), JetBrains Mono 400/500/700 (accents).
- **Icons:** all hand-drawn 24×24 stroke SVGs in `bb-icons.jsx` — `IconChevronLeft/Right`, `IconArrowRight`, `IconArrowUpRight`, `IconClose`, `IconCheck`, `IconHome`, `IconCalendar`, `IconUser`, `IconUsers`, `IconBolt`, `IconFlame`, `IconQR`, `IconCopy`, `IconPlus`, `IconLocation`, `IconClock`, `IconSettings`, `IconShare`, `IconSearch`, `IconBell`, `IconCrown`, `IconShield`. Default stroke width 1.6, currentColor. Replace with the target codebase's icon library; name mappings should be 1:1 obvious.
- **No photographic imagery** — the dramatic surfaces are achieved with linear-gradients + diagonal "mat-tape" stripe patterns + radial red glow. Photography can be added later behind the role split hero and class header without breaking the type lockup.
- **QR code:** the in-app QR is a deterministic pseudo-QR (9×9 grid seeded from the code string) — replace with a real QR encoder (e.g. `qrcode.react`, `qrcode-svg`) using the actual invite code.

## Files

All under the project root:
- `Black Belt App.html` — entrypoint, font + token CSS, mounts React.
- `bb-app.jsx` — App shell, stack-based router, Tweaks panel wiring.
- `bb-screens.jsx` — `ScreenSplash`, `ScreenOwner`, `ScreenStudent`, `ScreenStudentHome`, `ScreenClass`, plus `BeltPicker`, `BeltVisual`, `SlideToConfirm`, `BELTS` data.
- `bb-owner-home.jsx` — `ScreenOwnerHome` and all dashboard widgets (`OwnerPulse`, `OwnerLiveMat`, `OwnerQuickActions`, `OwnerClassRow`, `RosterSnapshot`, `RevenueCard`, `PromotionsList`, `ActivityFeed`, `OwnerTabBar`).
- `bb-icons.jsx` — icon set.
- `ios-frame.jsx` — iOS device chrome used only for the prototype canvas (drop in production).
- `tweaks-panel.jsx` — tweaks panel (drop in production).

## Implementation Notes for the Engineer

1. **Strip the iOS frame and Tweaks panel** — they exist only to present the design in a browser. The screens themselves are full-bleed phone content.
2. **Pick a real navigation library** (React Navigation, SwiftUI NavigationStack, Flutter Navigator 2.0) — replicate the splash → role → home flow.
3. **Real invite-code redemption + auth** are stubbed. Wire to your backend.
4. **Localization** — the prototype mixes PT and EN intentionally. Keep BJJ vocabulary in PT (faixa, tatame, professor, oss, mensalidade, graduar, chamada). Generic UI copy ("Continuar", "Compartilhar") should go through your i18n system so other markets can ship.
5. **The Belt model** is a fixed 5-step ladder + 0–4 stripes. Promotion = either +1 stripe or jump to next belt with stripes reset to 0. Black belt's "tip rail" is special and should be styled consistently anywhere a belt is rendered.
6. **Performance / motion** — keep transitions snappy on 60Hz devices. The pulse-halo and dot-loader are CSS-only and cheap; the slide-to-confirm uses pointer events and is also cheap. Disable the grain layer on low-end devices.
