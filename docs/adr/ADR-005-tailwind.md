# ADR-005: Tailwind CSS for Styling

## Status
Accepted

## Date
2026-05-10

## Owner
CarlosMagnani

---

## Context

BlackBelt has a high-fidelity design system defined in `design_handoff_black_belt/README.md` with specific tokens (colors, typography, spacing, border radius). The styling approach must implement this system consistently and quickly.

## Problem

Choose between Tailwind CSS, CSS Modules with CSS custom properties, or CSS-in-JS.

## Decision

Use Tailwind CSS with a custom theme that maps to BlackBelt design tokens.

## Alternatives Considered

| Option | Why Not Chosen |
|--------|----------------|
| CSS Modules + CSS variables | Valid option, but more boilerplate per component. Tailwind is faster for MVP speed. |
| CSS-in-JS (styled-components, Emotion) | Runtime overhead, more complex setup, no benefit over Tailwind for this use case. |
| Plain CSS | Too slow to maintain consistency across components. |

## Positive Consequences

- Fast to implement consistent UI — utility classes map directly to design tokens
- Custom theme extends (not replaces) Tailwind defaults with BlackBelt tokens
- Dark surface backgrounds, red accent, sharp corners all expressible as single classes
- Purging removes unused CSS — small production bundle
- Strong Vite integration

## Negative Consequences

- HTML gets verbose with many utility classes
- Must be careful not to use Tailwind default colors (slate-500, red-500) — only custom tokens
- Design tokens must be accurately configured in `tailwind.config.ts` or drift occurs

## Impact

All React components. `tailwind.config.ts` is the source of truth for design tokens in the frontend.

## Rollback Plan

Tailwind is compile-time only. Removing it means replacing utility classes with CSS Modules — contained to component files.

---

## Notes

`tailwind.config.ts` must define:
```ts
theme: {
  extend: {
    colors: {
      'bb-bg': '#0A0A0A',
      'bb-surface': '#161616',
      'bb-line': '#242424',
      'bb-text': '#F5F5F5',
      'bb-muted': '#6B6B6B',
      'bb-red': '#FF3B3B',
      'bb-red-deep': '#C81E2D',
      // ... full token set
    },
    fontFamily: {
      display: ['Archivo Black', 'system-ui'],
      body: ['Inter', 'system-ui'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    borderRadius: {
      none: '0px', // default for BlackBelt
    }
  }
}
```

Do not use `text-red-500` or any Tailwind default color class anywhere in the codebase. Only `text-bb-red`, `bg-bb-surface`, etc.
