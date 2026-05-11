Sync the current Black Belt session state into the Obsidian vault at C:\obsidian-vault\projects\Black belt\.

Follow this exact process:

## Step 1 — Read current state

Read these files:
- docs/ai-context/current-handoff.md
- docs/ai-context/06-current-roadmap.md

## Step 2 — Create a session note

Create a new session note at:
`C:\obsidian-vault\projects\Black belt\<YYYY-MM-DD> - Sessão <short-topic>.md`

Use today's date (check current date from system). Use a 2-4 word topic describing what was done this session.

The session note must follow this exact frontmatter and structure:

```markdown
---
tags:
  - blackbelt
  - sessão
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
tipo: sessão-de-trabalho
---

# Sessão: <topic>

**Data:** <YYYY-MM-DD>
**Objetivo:** <one sentence — what we were trying to do>

## O que foi feito

<bullet list of concrete things completed — files created, features implemented, bugs fixed>

## Decisões tomadas

| Decisão | Justificativa |
|---------|---------------|
| <decision> | <reason> |

## Aberto / Pendente

<copy the open questions from current-handoff.md as a checkbox list>

## Próxima sessão

<copy the next steps from current-handoff.md as a numbered list>

## Links

- [[000 MOC - Black Belt]]
- [[<any relevant notes from this session>]]
```

## Step 3 — Update the MOC

Open `C:\obsidian-vault\projects\Black belt\000 MOC - Black Belt.md`.

Add the new session note link under the "Sessões de Trabalho" section:
```
- [[<YYYY-MM-DD> - Sessão <topic>]] — <one-line description>
```

## Step 4 — Update any changed atomic notes

If this session changed any of the following, update the corresponding Obsidian note:
- Domain rules changed → update `003 - Regras de Domínio.md`
- Architecture changed → update `007 - Arquitetura.md`  
- Tech stack decisions made → update `008 - Tech Stack.md`
- Data model changed → update `011 - Modelo de Dados.md`
- Roadmap items completed → update `010 - Roadmap.md` (check off completed items)
- Design rules changed → update `009 - Design System.md`

Only update notes where something actually changed. Do not rewrite stable notes.

## Step 5 — Report what was synced

After completing, report:
- Session note created: <path>
- MOC updated: yes/no
- Atomic notes updated: <list or "none">
- Vault is up to date.
