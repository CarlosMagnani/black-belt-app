# Checklist: React PWA

Run before completing any frontend change.

---

**Design Tokens**
- [ ] All colors use CSS variables (`var(--red)`, `var(--surface)`, etc.) — no hardcoded hex
- [ ] Typography uses the correct font families (Archivo Black / Inter / JetBrains Mono)
- [ ] Font sizes match the typography scale in `docs/ai-context/04-design-rules.md`
- [ ] Spacing uses correct values (24px page padding, 16-18px card padding)
- [ ] Border radius is 0 (sharp corners) unless explicitly using the "rounded" variant

**Layout**
- [ ] Mobile-first: looks correct at 375px width
- [ ] No horizontal scroll at 375px
- [ ] Bottom tab navigation (not hamburger menu)
- [ ] Content has 24px side padding
- [ ] Sections have 20-24px vertical spacing

**Interactivity**
- [ ] All interactive elements have minimum 44×44px touch target
- [ ] Primary CTA button is 56px tall
- [ ] Form inputs are 56px tall with 18px horizontal padding
- [ ] Focus states are visible (red outline)
- [ ] Hover states match design spec (red border, red glow on primary button)

**States**
- [ ] Loading state handled (skeleton or spinner)
- [ ] Empty state handled (message + action)
- [ ] Error state handled (human-readable message + retry)
- [ ] Form disabled state handled (opacity 0.4, no cursor)

**Accessibility**
- [ ] Form inputs have associated labels
- [ ] Interactive elements without visible text have `aria-label`
- [ ] Color is not the only signal for state (also use text or icon)
- [ ] Tab order is logical

**Component Reuse**
- [ ] Checked existing components before creating new ones
- [ ] Not duplicating layout patterns that already exist
- [ ] Icons from the existing icon set (bb-icons.jsx reference), not a new library

**PWA**
- [ ] No native-only APIs used (camera, notifications — deferred)
- [ ] App works without JavaScript for basic content (progressive enhancement)
- [ ] Images use `alt` attributes
