# Prompt: Review React PWA Implementation

Use this to verify a React component or screen follows BlackBelt's design and PWA rules.

---

## Template

```
I am building BlackBelt — a React PWA for BJJ academy management.

Review this React component/screen for compliance with BlackBelt's design and PWA rules.

Design rules (from docs/ai-context/04-design-rules.md):
- Design tokens must be CSS variables (--red, --surface, --text, etc.)
- Typography: Archivo Black for display, Inter for body, JetBrains Mono for mono
- Sharp corners (border-radius: 0) by default
- Mobile-first (375px base width)
- Touch targets minimum 44px
- Bottom tab navigation
- No invented colors, no new design patterns

Component/screen to review:
[paste the code]

Check for:
1. Design token usage (no hardcoded hex values)
2. Typography compliance (correct font families and sizes)
3. Mobile-first layout (375px works without scroll)
4. Touch target sizes (all interactive elements ≥ 44px)
5. Color usage (only from the defined token set)
6. Component reuse (are existing components used where possible?)
7. Loading, empty, and error states handled
8. Accessibility (labels, contrast, focus states)
9. No unnecessary animations or effects

For each check: PASS / FAIL / WARN with location if failing.
```
