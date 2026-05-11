# Workflow: Frontend Change

For adding or modifying UI screens and components in the React PWA.

---

## Steps

### 1. Read the Design Reference

Before writing any code, read:
- `design_handoff_black_belt/README.md` — full design spec
- `docs/ai-context/04-design-rules.md` — design rules summary

Identify:
- Which screen from the handoff is the reference
- Which existing components can be reused
- Which design tokens apply

### 2. Pre-implementation Checklist

Run `.ai/checklists/react-pwa.md`.

### 3. Identify Existing Patterns

Search the codebase before creating new components.

- Is there an existing component that does this?
- Is there an existing layout pattern that fits?
- Is there an existing hook that handles this state?

Reuse first.

### 4. Implement

Order:
1. Structure (HTML/JSX layout matching the design)
2. Styles (design tokens from CSS variables)
3. State (local component state or hook)
4. API connection (call the service, handle loading/error/empty)
5. Interactions (hover, tap, animation — only what's in the design)

### 5. Verify Mobile First

Check at 375px width before anything else.

- All content visible without horizontal scroll
- All tap targets ≥ 44px
- Navigation accessible from the bottom bar
- Text readable (contrast, size)

### 6. Check Design Compliance

Use `.ai/prompts/review-react-pwa.md`.

All design token values must be CSS variables, not hardcoded hex.

### 7. Test Edge Cases

- Loading state (data fetching)
- Empty state (no data)
- Error state (API failure)
- Long text (names, academy names, class titles)

### 8. Update Handoff

Update `docs/ai-context/current-handoff.md`.
