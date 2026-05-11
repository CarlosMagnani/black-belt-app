# Design Rules — BlackBelt

## Design Source of Truth

The BlackBelt design system is already defined.

All design specifications, components, screens, tokens, and interactions are in:

```
design_handoff_black_belt/README.md     ← read this first
design_handoff_black_belt/bb-screens.jsx
design_handoff_black_belt/bb-owner-home.jsx
design_handoff_black_belt/Black Belt App.html
```

AI agents must not create a new design system. The design is high-fidelity and final.

---

## Design Philosophy

BlackBelt feels:
- **Premium fight-club** — dark, cinematic, refined
- **Mobile-first** — designed for the mat, not the boardroom
- **Focused** — every screen has one main action
- **Consistent** — all screens share the same visual language
- **Practical** — fast to use on a phone after training

The aesthetic: near-black surfaces, hot red accents, sharp edges, strong typography. Not playful. Not corporate. Martial.

---

## Design Tokens

These are the exact values. Use CSS variables. Do not hardcode hex values.

### Colors

```css
--bg:        #0A0A0A;   /* App background, safe areas */
--bg-2:      #111111;
--surface:   #161616;   /* Cards, inputs, icon buttons */
--surface-2: #1C1C1E;
--line:      #242424;   /* Default 1px borders */
--line-2:    #2F2F2F;   /* Stronger borders, ghost buttons */
--muted:     #6B6B6B;
--muted-2:   #8E8E93;   /* Body sub-copy */
--text:      #F5F5F5;   /* Primary text */
--text-2:    #C8C8C8;

--red:       #FF3B3B;   /* Brand accent — CTAs, live state, active */
--red-deep:  #C81E2D;   /* Gradient bottom, code card borders */
--red-glow:  rgba(255, 59, 59, 0.35);
--gold:      #C9A24A;   /* Reserved — do not use until explicitly approved */
```

Never introduce a color not in this list without approval.

### Fonts

```
Display:  'Archivo Black', 'Anton', system-ui, sans-serif
Body:     'Inter', -apple-system, system-ui, sans-serif
Mono:     'JetBrains Mono', ui-monospace, monospace
```

Load from Google Fonts:
- Archivo Black
- Anton (used for splash wordmark only)
- Inter (weights: 300, 400, 500, 600, 700)
- JetBrains Mono (weights: 400, 500, 700)

---

## Typography Scale

| Use | Size | Font | Style |
|-----|------|------|-------|
| Splash logo wordmark | 76px | Anton | Uppercase |
| Big screen headline | 38px | Archivo Black | Uppercase, -0.01em tracking, 0.95 line-height |
| Section title | 22px | Archivo Black | Uppercase |
| Hero number | 56px | Archivo Black | |
| Card title | 16–17px | Archivo Black | |
| Eyebrow kicker | 11px | JetBrains Mono | Uppercase, 0.2em tracking, `--muted-2` |
| Mono caption | 9–11px | JetBrains Mono | 0.12–0.18em tracking |
| Body text | 13–14px | Inter | `--muted-2` for sub-copy |
| Form input value | 17px | Inter | |
| Invite code input | 22px | JetBrains Mono | 0.1em tracking, uppercase |

Display type (Archivo Black) is always uppercase with letter-spacing `-0.01em` and line-height `0.95`.

---

## Spacing

| Context | Value |
|---------|-------|
| Page side padding | 24px |
| Card padding | 16–18px |
| Vertical section spacing | 20–24px |
| Button height (primary) | 56px |
| Button height (ghost) | 50px |
| Button height (icon button) | 38px |
| Tab bar bottom safe area | 28px |

---

## Borders and Shape

- Border radius: **0px by default** — sharp corners everywhere
- The "Rounded" preference adds 14px to buttons, inputs, and cards — this is user-configurable, not the default
- Default border: `1px solid var(--line)`
- Stronger border: `1px solid var(--line-2)`
- Active/focused border: `1px solid var(--red)`

---

## Shadows

- Primary red button (hover): `0 0 28px var(--red-glow)`
- Slide-to-confirm thumb: `0 0 24px var(--red-glow)`
- No general drop shadows anywhere else
- No box shadows on cards or surfaces — elevation is implied by background color steps

---

## Effects

- Film grain overlay (`bb-grain::after`): SVG fractalNoise at 6% opacity, `mix-blend-mode: screen` on every screen
- Disable grain on low-end devices (media query: prefers-reduced-motion or performance detection)
- Diagonal mat-tape stripes: used in the live class header and owner dashboard, `rotate(-12deg)` at 5% opacity

---

## Component Rules

### Cards

- Background: `var(--surface)` or `var(--surface-2)`
- Border: `1px solid var(--line)`
- Padding: 16–18px
- No border radius (default)
- Highlight state: `var(--red-deep)` border + slight surface tint

### Buttons

**Primary (CTA):**
- Height: 56px
- Background: `var(--red)`
- Text: `var(--text)`, Archivo Black or Inter 600, uppercase
- Width: full-width for onboarding CTAs
- Hover: lift 1px + `0 0 28px var(--red-glow)` shadow

**Ghost:**
- Height: 50px
- Background: transparent
- Border: `1px solid var(--line-2)`
- Text: `var(--text-2)`

**Icon button:**
- Size: 38×38px
- Background: `var(--surface)`
- No label

Disabled buttons: reduced opacity (`0.4`), no cursor pointer.

### Form Inputs

- Height: 56px
- Horizontal padding: 18px
- Background: `var(--surface)`
- Border: `1px solid var(--line)`, focus: `1px solid var(--red)`
- Font: 17px Inter
- Invite/code inputs: 22px JetBrains Mono, 0.1em tracking, uppercase

### Navigation

**Bottom tab bar (4–5 items):**
- 18px stroke icons
- 9px JetBrains Mono label, 0.18em tracking, uppercase
- Active: `var(--red)` icon + label
- Inactive: `var(--muted)`
- Padding: `10px 0 28px` (safe area for iOS home indicator)

### Belt Visual

Belt colors by rank:
- White: `#F0F0F0` with optional tip
- Blue: `#1A52A8`
- Purple: `#6B3FA0`
- Brown: `#7B3F00`
- Black: `#0A0A0A` with red tip accent
- Coral: coral gradient
- Red: `#CC0000`

Black belt carries a red 8px bar on its tip — always render this.

Degree stripes: 4px wide × 26px tall, red when active, `var(--line-2)` when inactive.

### Modals / Dialogs

- Background: `var(--surface)` on dark overlay (`rgba(0,0,0,0.7)`)
- Follow card rules for padding and borders
- One clear primary action button
- Destructive actions use red text, not red button background

### Lists and Rows

- 1px line divider: `var(--line)`
- Highlighted row: `var(--red-deep)` left border (4px) + surface background
- Left time block on class rows: 76px wide, 22px display time + 9px mono duration

---

## Animations and Interactions

- **Page enter:** 320ms `cubic-bezier(0.2, 0.8, 0.2, 1)`, slides 28px from right + fade
- **Stagger:** children delay 40/100/160/220/280/340ms
- **Pulse halo:** 2.4s ease-in-out infinite — `box-shadow` from `0 0 0 0 rgba(255,59,59,0.5)` to `0 0 0 18px rgba(255,59,59,0)`. Used on flame icon, live dots, avatar rings.
- **Dot loader:** 3 × 6px red dots, 1.2s infinite blink, 200ms offset per dot
- **Slide-to-confirm:** pointer events, clamp x to track bounds, snap on release
- Avoid animations not listed above. Keep the UI snappy, not animated.

---

## Mobile-First and PWA Rules

- Design for 375px screen width first
- All main flows must work on mobile without horizontal scroll
- Touch targets: minimum 44×44px (iOS HIG requirement)
- Avoid hover-only interactions — everything must be tap-accessible
- Avoid dense screens — one clear action per screen
- Bottom bar navigation (not hamburger menu) for mobile
- Safe area insets respected on iOS (bottom tab bar has 28px padding)
- The app should feel close to native even though it's a PWA

---

## Responsive Behavior

- Mobile (default): full-width layouts, bottom navigation
- Tablet and desktop: can widen the content area with max-width (~480px center column)
- Do not build a completely different desktop layout for MVP
- Desktop is a nice-to-have; mobile is the primary experience

---

## Loading, Empty, and Error States

Every screen that fetches data must handle:

**Loading:** Skeleton loaders or subtle spinner. Match the layout shape (not a generic spinner in the middle).

**Empty:** Message + action. Example: "No classes today. Check the full schedule →"

**Error:** Human-readable message + retry action. Never show raw errors or stack traces.

Keep these states consistent across the app.

---

## Accessibility Expectations

- Minimum 4.5:1 contrast ratio for text on backgrounds
- Interactive elements have labels (aria-label if no visible text)
- Form inputs have associated labels
- Tab order is logical (follows visual order)
- Focus states are visible (red outline matches the brand)
- Do not use color as the only signal (red check-in state also uses text)

---

## UX Writing Tone

- Short. Direct. No fluff.
- BJJ vocabulary stays in Portuguese: faixa, tatame, professor, oss, mensalidade, graduar, chamada, aluno, mestre
- Generic UI copy in English or Portuguese (consistent within a screen)
- CTAs are action verbs: "Confirm", "Continuar", "Entrar no Tatame"
- Avoid passive voice in CTAs
- Error messages say what went wrong and what to do next

---

## New Screen Rules

Before creating a new screen:

1. Identify which existing screen is the closest reference
2. Identify which existing components can be reused
3. Identify which user role uses this screen
4. Identify the single main action on the screen
5. Follow the same layout pattern as the reference screen

Do not invent a new layout without checking existing patterns first.

---

## Forbidden Design Actions

AI agents must not:

- Introduce new colors not in the token list
- Change typography without approval
- Add border radius where sharp corners are specified
- Redesign existing components
- Mix UI styles from other design systems (Material, Ant, Chakra, etc.)
- Create inconsistent button sizes or types
- Add unnecessary animations or transitions
- Make the UI visually complex for the MVP
- Use photographic imagery in component backgrounds (gradients only)
- Change the tab bar structure without approval
- Redesign the belt visual component
